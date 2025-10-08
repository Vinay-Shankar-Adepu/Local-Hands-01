import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app.js';
import User from '../models/User.js';
import ServiceTemplate from '../models/ServiceTemplate.js';

/*
  Integration test: provider relocation after booking completion.
  Flow:
    - Register customer & provider
    - Provider selects a template service
    - Customer creates multi booking near (lat:10,lng:20)
    - Offer goes to provider (single provider scenario)
    - Provider accepts booking (status -> accepted)
    - Simulate in_progress by sending a location update (auto-progress) OR patch acceptance already sets lock
    - Provider completes booking
    - Assert provider location & lastServiceLocation updated to booking coords
*/

async function createUser(name, role){
  const password='Passw0rd!';
  const reg = await request(app).post('/api/auth/register').send({ name, email: `${Date.now()}_${name}@relocate.test`, password, role });
  const login = await request(app).post('/api/auth/login').send({ email: reg.body.user.email, password });
  // login response returns user.id (not _id)
  return { token: login.body.token, id: login.body.user.id };
}

describe('Provider relocation on completion', () => {
  let customer, provider, templateId;

  beforeAll(async () => {
    if(!process.env.MONGO_URI) process.env.MONGO_URI='mongodb://127.0.0.1:27017/localhands_test';
    await mongoose.connect(process.env.MONGO_URI);
    const cat = await mongoose.connection.collection('categories').insertOne({ name:'Relocate', slug:'relocate', createdAt:new Date(), updatedAt:new Date() });
    const tpl = await ServiceTemplate.create({ name:'Relocate Service', category: cat.insertedId, defaultPrice:50, active:true });
    templateId = tpl._id.toString();
    customer = await createUser('RelocateCustomer','customer');
    provider = await createUser('RelocateProvider','provider');
    // Provider selects service (auto marks available in test mode)
    await request(app).post('/api/providers/select-services').set('Authorization',`Bearer ${provider.token}`).send({ templateIds:[templateId] });
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  });

  it('updates provider location & lastServiceLocation to booking coordinates after completion', async () => {
    const targetCoords = { lng: 20, lat: 10 };
    // Create booking (multi) -> single provider will receive offer immediately
    const create = await request(app).post('/api/bookings/create-multi')
      .set('Authorization',`Bearer ${customer.token}`)
      .send({ templateId, ...targetCoords });
    expect(create.status).toBe(200);
    const bookingId = create.body.booking._id;

    // Provider accepts
    const offers = await request(app).get('/api/bookings/offers/mine').set('Authorization',`Bearer ${provider.token}`);
    expect(offers.status).toBe(200);
    const offer = offers.body.offers.find(o=> o._id === bookingId);
    expect(offer).toBeTruthy();
    const accept = await request(app).patch(`/api/bookings/${bookingId}/offer/accept`).set('Authorization',`Bearer ${provider.token}`).send({});
    expect(accept.status).toBe(200);

    // Simulate movement to trigger in_progress (if still accepted)
    await request(app).patch('/api/providers/location').set('Authorization',`Bearer ${provider.token}`).send(targetCoords);

    // Complete booking
    const complete = await request(app).patch(`/api/bookings/${bookingId}/complete`).set('Authorization',`Bearer ${provider.token}`).send({});
    expect(complete.status).toBe(200);
    expect(complete.body.booking.status).toBe('completed');

    // Fetch provider doc
    const providerDoc = await User.findById(provider.id).lean();
    expect(providerDoc).toBeTruthy();
    const loc = providerDoc.location?.coordinates;
    const last = providerDoc.lastServiceLocation?.coordinates;
    expect(Array.isArray(loc)).toBe(true);
    expect(Array.isArray(last)).toBe(true);
    // Stored format is [lng, lat]
    expect(loc[0]).toBeCloseTo(targetCoords.lng, 5);
    expect(loc[1]).toBeCloseTo(targetCoords.lat, 5);
    expect(last[0]).toBeCloseTo(targetCoords.lng, 5);
    expect(last[1]).toBeCloseTo(targetCoords.lat, 5);
  });
});
