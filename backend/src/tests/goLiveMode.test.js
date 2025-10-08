import request from 'supertest';
import app from '../app.js';
import mongoose from 'mongoose';
import User from '../models/User.js';
import ServiceTemplate from '../models/ServiceTemplate.js';

let customerToken, providerToken, templateId;

async function createUser(name, role){
  const password='Passw0rd!';
  const reg = await request(app).post('/api/auth/register').send({ name, email: `${Date.now()}_${name}@test.com`, password, role });
  const login = await request(app).post('/api/auth/login').send({ email: reg.body.user.email, password });
  return { token: login.body.token, id: reg.body.user._id };
}

beforeAll(async ()=>{
  if(!process.env.MONGO_URI) process.env.MONGO_URI='mongodb://127.0.0.1:27017/localhands_test';
    process.env.STRICT_TEST_LIVE_ENFORCE = '1';
  await mongoose.connect(process.env.MONGO_URI);
  const cat = await mongoose.connection.collection('categories').insertOne({ name:'Home', slug:'home', createdAt:new Date(), updatedAt:new Date() });
  const tpl = await ServiceTemplate.create({ name:'Plumbing', category: cat.insertedId, defaultPrice:40, active:true });
  templateId = tpl._id.toString();
  const cust = await createUser('CustGo','customer');
  customerToken = cust.token;
  const prov = await createUser('ProvGo','provider');
  providerToken = prov.token; // note: provider starts offline (isAvailable false by default in non-test override path)
  await request(app).post('/api/providers/select-services').set('Authorization',`Bearer ${providerToken}`).send({ templateIds:[templateId] });
  // Force provider offline to ensure test baseline
  await User.updateOne({ _id: prov.id }, { $set: { isAvailable: false } });
});

afterAll(async ()=>{
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});

it('rejects multi booking when no live providers', async ()=>{
  const res = await request(app).post('/api/bookings/create-multi').set('Authorization',`Bearer ${customerToken}`).send({ templateId, lng:1, lat:1 });
  expect(res.status).toBe(400);
  expect(res.body.message).toMatch(/No live providers/i);
});

it('allows booking after provider goes live', async ()=>{
  const live = await request(app).patch('/api/providers/go-live').set('Authorization',`Bearer ${providerToken}`).send();
  expect(live.status).toBe(200);
  const res = await request(app).post('/api/bookings/create-multi').set('Authorization',`Bearer ${customerToken}`).send({ templateId, lng:1, lat:1 });
  expect(res.status).toBe(200);
  expect(res.body.booking.offers.length).toBe(1);
});

it('provider logout auto sets offline', async ()=>{
  const out = await request(app).post('/api/auth/logout').set('Authorization',`Bearer ${providerToken}`).send();
  expect(out.status).toBe(200);
  const u = await User.findOne({ 'email': /ProvGo/ });
  expect(u.isAvailable).toBe(false);
});
