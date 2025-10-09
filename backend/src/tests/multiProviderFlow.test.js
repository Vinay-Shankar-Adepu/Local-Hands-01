import request from 'supertest';
import app from '../app.js';
import mongoose from 'mongoose';
import User from '../models/User.js';
import ServiceTemplate from '../models/ServiceTemplate.js';
import Service from '../models/Service.js';
import Booking from '../models/Booking.js';

// NOTE: This is a lightweight smoke test to validate multi-provider booking creation and offer acceptance logic.

let customerToken, provider1Token, provider2Token, templateId;

async function createUser(name, role, rating=4.5, ratingCount=10){
  const password = 'Passw0rd!';
  const res = await request(app).post('/api/auth/register').send({ name, email: `${Date.now()}_${name}@test.com`, password, role });
  const login = await request(app).post('/api/auth/login').send({ email: res.body.user.email, password });
  // Directly update rating to simulate experience
  await User.findByIdAndUpdate(res.body.user._id,{ rating, ratingCount, isAvailable: role==='provider' });
  return { token: login.body.token, userId: res.body.user._id };
}

beforeAll(async () => {
  if(!process.env.MONGO_URI) process.env.MONGO_URI = 'mongodb://127.0.0.1:27017/localhands_test';
  await mongoose.connect(process.env.MONGO_URI);

  // Ensure template exists
  const cat = await mongoose.connection.collection('categories').insertOne({ name: '📱 Technology & Appliances', slug: 'technology-appliances', createdAt:new Date(), updatedAt:new Date() });
  const tpl = await ServiceTemplate.create({ name: 'Mobile Repair', category: cat.insertedId, defaultPrice: 90, active: true });
  templateId = tpl._id.toString();

  const customer = await createUser('CustomerA','customer');
  customerToken = customer.token;
  const p1 = await createUser('ProviderA','provider',4.9,30);
  provider1Token = p1.token;
  const p2 = await createUser('ProviderB','provider',4.7,20);
  provider2Token = p2.token;

  // Providers select template (services)
  for(const tk of [provider1Token, provider2Token]){
    await request(app).post('/api/providers/select-services').set('Authorization',`Bearer ${tk}`).send({ templateIds:[templateId] });
  }
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});

let bookingId;

it('creates a multi-provider booking', async () => {
  const res = await request(app).post('/api/bookings/create-multi').set('Authorization',`Bearer ${customerToken}`).send({ templateId, lng:77.6, lat:12.9 });
  expect(res.status).toBe(200);
  expect(res.body.booking).toBeDefined();
  expect(res.body.booking.offers.length).toBe(1);
  expect(res.body.booking.pendingProviders.length).toBe(1);
  bookingId = res.body.booking._id;
});

it('provider can go offline and not receive new first offers', async () => {
  // Provider2 goes offline
  const offline = await request(app).patch('/api/providers/go-offline').set('Authorization',`Bearer ${provider2Token}`).send();
  expect(offline.status).toBe(200);
  // Create another booking; expect first offer goes to ProviderA again (still available)
  const res2 = await request(app).post('/api/bookings/create-multi').set('Authorization',`Bearer ${customerToken}`).send({ templateId, lng:77.6, lat:12.9 });
  expect(res2.status).toBe(200);
  const offerProviderId = res2.body.booking.offers[0].provider;
  const provA = await User.findOne({ email: /ProviderA/ });
  expect(offerProviderId.toString()).toBe(provA._id.toString());
});

it('decline first offer advances to second provider', async () => {
  // First provider declines
  const decline = await request(app).patch(`/api/bookings/${bookingId}/offer/decline`).set('Authorization',`Bearer ${provider1Token}`).send();
  expect(decline.status).toBe(200);
  expect(decline.body.booking.offers.filter(o=>o.status==='declined').length).toBe(1);
  expect(decline.body.booking.offers.filter(o=>o.status==='pending').length).toBe(1);
});

it('second provider accepts offer', async () => {
  const accept = await request(app).patch(`/api/bookings/${bookingId}/offer/accept`).set('Authorization',`Bearer ${provider2Token}`).send();
  expect(accept.status).toBe(200);
  expect(accept.body.booking.status).toBe('accepted');
  expect(accept.body.booking.provider).toBeDefined();
});

it('simulates expiration advancing offer queue', async () => {
  // Create fresh booking so we have pending offers again
  const newBookingRes = await request(app).post('/api/bookings/create-multi').set('Authorization',`Bearer ${customerToken}`).send({ templateId, lng:77.6, lat:12.9 });
  expect(newBookingRes.status).toBe(200);
  const b = await Booking.findById(newBookingRes.body.booking._id);
  // Force timeout into past
  b.providerResponseTimeout = new Date(Date.now() - 60 * 1000);
  await b.save();
  // Trigger lazy expiration via provider1 offers listing
  await request(app).get('/api/bookings/offers/mine').set('Authorization',`Bearer ${provider1Token}`).send();
  const updated = await Booking.findById(b._id).lean();
  const expiredCount = updated.offers.filter(o=>o.status==='expired').length;
  expect(expiredCount).toBeGreaterThanOrEqual(1);
});

