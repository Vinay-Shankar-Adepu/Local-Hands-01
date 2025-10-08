import request from 'supertest';
import app from '../app.js';
import mongoose from 'mongoose';
import User from '../models/User.js';
import ServiceTemplate from '../models/ServiceTemplate.js';
import Booking from '../models/Booking.js';
import Notification from '../models/Notification.js';

let customerToken, providerToken, templateId, bookingIdAccepted;

async function createUser(name, role){
  const password='Passw0rd!';
  const reg = await request(app).post('/api/auth/register').send({ name, email: `${Date.now()}_${name}@test.com`, password, role });
  const login = await request(app).post('/api/auth/login').send({ email: reg.body.user.email, password });
  if(role==='provider') await User.findByIdAndUpdate(reg.body.user._id, { isAvailable: true, rating:4.5, ratingCount:10 });
  return { token: login.body.token, id: reg.body.user._id };
}

beforeAll(async ()=>{
  if(!process.env.MONGO_URI) process.env.MONGO_URI='mongodb://127.0.0.1:27017/localhands_test';
  await mongoose.connect(process.env.MONGO_URI);
  const cat = await mongoose.connection.collection('categories').insertOne({ name:'Home Services', slug:'home-services', createdAt:new Date(), updatedAt:new Date() });
  const tpl = await ServiceTemplate.create({ name:'General Fix', category: cat.insertedId, defaultPrice:50, active:true });
  templateId = tpl._id.toString();
  const customer = await createUser('CustX','customer');
  customerToken = customer.token;
  const provider = await createUser('ProvX','provider');
  providerToken = provider.token;
  // Provider selects template
  await request(app).post('/api/providers/select-services').set('Authorization',`Bearer ${providerToken}`).send({ templateIds:[templateId] });
});

afterAll(async ()=>{
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});

it('allows cancellation without reason before acceptance', async ()=>{
  const res = await request(app).post('/api/bookings/create-multi').set('Authorization',`Bearer ${customerToken}`).send({ templateId, lng:10, lat:10 });
  expect(res.status).toBe(200);
  const id = res.body.booking._id;
  const cancel = await request(app).patch(`/api/bookings/${id}/cancel`).set('Authorization',`Bearer ${customerToken}`).send({});
  expect(cancel.status).toBe(200);
  expect(cancel.body.booking.status).toBe('cancelled');
});

it('requires reason after provider acceptance', async ()=>{
  // fresh booking
  const res = await request(app).post('/api/bookings/create-multi').set('Authorization',`Bearer ${customerToken}`).send({ templateId, lng:11, lat:11 });
  bookingIdAccepted = res.body.booking._id;
  // Force provider to accept first offer
  const offerProviderId = res.body.booking.offers[0].provider;
  // Accept as provider
  const accept = await request(app).patch(`/api/bookings/${bookingIdAccepted}/offer/accept`).set('Authorization',`Bearer ${providerToken}`).send();
  expect(accept.status).toBe(200);
  expect(accept.body.booking.status).toBe('accepted');
  // Attempt cancel with no reason
  const badCancel = await request(app).patch(`/api/bookings/${bookingIdAccepted}/cancel`).set('Authorization',`Bearer ${customerToken}`).send({});
  expect(badCancel.status).toBe(400);
  // Valid cancel with reason
  const goodCancel = await request(app).patch(`/api/bookings/${bookingIdAccepted}/cancel`).set('Authorization',`Bearer ${customerToken}`).send({ reason:'Customer changed mind' });
  expect(goodCancel.status).toBe(200);
  expect(goodCancel.body.booking.cancelReason).toBeDefined();
});

it('creates provider notification on cancellation after acceptance', async ()=>{
  const notes = await Notification.find({ type:'booking_cancelled' });
  expect(notes.length).toBeGreaterThan(0);
});

it('prevents cancelling a completed booking', async ()=>{
  // Create and accept then complete
  const res = await request(app).post('/api/bookings/create-multi').set('Authorization',`Bearer ${customerToken}`).send({ templateId, lng:12, lat:12 });
  const bid = res.body.booking._id;
  await request(app).patch(`/api/bookings/${bid}/offer/accept`).set('Authorization',`Bearer ${providerToken}`).send();
  // manually set status to completed
  const b = await Booking.findById(bid); b.status='completed'; await b.save();
  const cancel = await request(app).patch(`/api/bookings/${bid}/cancel`).set('Authorization',`Bearer ${customerToken}`).send({ reason:'too late' });
  expect(cancel.status).toBe(400);
});
