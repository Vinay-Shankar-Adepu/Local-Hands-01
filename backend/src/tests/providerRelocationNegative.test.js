import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app.js';
import ServiceTemplate from '../models/ServiceTemplate.js';
import User from '../models/User.js';

async function createUser(name, role){
  const password='Passw0rd!';
  const reg = await request(app).post('/api/auth/register').send({ name, email: `${Date.now()}_${name}@neg.test`, password, role });
  const login = await request(app).post('/api/auth/login').send({ email: reg.body.user.email, password });
  return { token: login.body.token, id: login.body.user.id };
}

describe('Provider relocation negative guard', () => {
  let customer, provider, templateId;
  beforeAll(async () => {
    if(!process.env.MONGO_URI) process.env.MONGO_URI='mongodb://127.0.0.1:27017/localhands_test';
    await mongoose.connect(process.env.MONGO_URI);
    const cat = await mongoose.connection.collection('categories').insertOne({ name:'NegCat', slug:'negcat', createdAt:new Date(), updatedAt:new Date() });
    const tpl = await ServiceTemplate.create({ name:'NegService', category: cat.insertedId, defaultPrice:25, active:true });
    templateId = tpl._id.toString();
    customer = await createUser('NegCustomer','customer');
    provider = await createUser('NegProvider','provider');
    await request(app).post('/api/providers/select-services').set('Authorization',`Bearer ${provider.token}`).send({ templateIds:[templateId] });
  });
  afterAll(async () => { await mongoose.connection.dropDatabase(); await mongoose.disconnect(); });

  it('does NOT relocate provider when completion attempted before acceptance', async () => {
    const target = { lng: 44, lat: 11 };
    const create = await request(app).post('/api/bookings/create-multi').set('Authorization',`Bearer ${customer.token}`).send({ templateId, ...target });
    expect(create.status).toBe(200);
    const bookingId = create.body.booking._id;
    // Immediately attempt completion (provider side) without accept/in_progress
    const complete = await request(app).patch(`/api/bookings/${bookingId}/complete`).set('Authorization',`Bearer ${provider.token}`).send();
    expect(complete.status).toBe(400); // Guard should reject
    const providerDoc = await User.findById(provider.id).lean();
    // Ensure location not changed to booking coords (default test auto-availability sets some coords maybe [0,0])
    const loc = providerDoc.location?.coordinates || [];
    // must not match booking coords exactly
    expect(!(loc[0] === target.lng && loc[1] === target.lat)).toBe(true);
  });
});
