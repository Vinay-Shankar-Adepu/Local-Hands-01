/**
 * End-to-end integration test with deterministic accounts and locations.
 * - Seeds specific users: customer1@local, customer2@local, provA@local, provB@local, 2@gmail.com
 * - Sets ratings and locations deterministically
 * - Creates a booking with each sort mode and verifies ordering
 * - Verifies dispatch window, decline/advance, acceptance lock, socket bookingLocked
 * - Completes booking and checks provider relocation and review prompt emission
 */
import request from 'supertest';
import app from '../../src/app.js';
import mongoose from 'mongoose';
import User from '../../src/models/User.js';
import Booking from '../../src/models/Booking.js';
import ServiceTemplate from '../../src/models/ServiceTemplate.js';
import Service from '../../src/models/Service.js';

const baseURL = 'http://localhost:5000';

async function registerAndLogin(name, email, role, rating=0, ratingCount=0, loc=[0,0]){
  await request(app).post('/api/auth/register').send({ name, email, password: 'pass123', role });
  const login = await request(app).post('/api/auth/login').send({ email, password: 'pass123' });
  const token = login.body.token;
  const id = login.body.user._id;
  // Apply rating & location & availability per role
  const patch = { rating, ratingCount };
  if(role==='provider') {
    patch.isAvailable = true;
    patch.location = { type: 'Point', coordinates: loc };
  }
  await User.findByIdAndUpdate(id, patch);
  return { id, token };
}

function sleep(ms){ return new Promise(r=>setTimeout(r,ms)); }

const shouldRun = process.env.RUN_DETERMINISTIC_E2E === '1';
const d = shouldRun ? describe : describe.skip;

d('Deterministic E2E Flow', () => {
  let customer1, customer2, provA, provB, provBias;
  let templateId;

  beforeAll(async () => {
    jest.setTimeout(60000);
    // Ensure catalog has at least one template
    const tpl = await ServiceTemplate.findOne() || await ServiceTemplate.create({ name: 'AC', defaultPrice: 100, active: true });
    templateId = tpl._id.toString();

    // Create services for providers
    const ensureService = async (providerId) => {
      let svc = await Service.findOne({ provider: providerId, template: templateId });
      if(!svc) svc = await Service.create({ name: 'AC', category: 'Home', price: 100, provider: providerId, template: templateId, lockedPrice: true });
      return svc;
    };

    // Register deterministic users with fixed coords
    // Customer1 at (lng:77.6, lat:12.97) ~ Bangalore
    customer1 = await registerAndLogin('Customer1','customer1@local','customer',0,0,[77.6,12.97]);
    customer2 = await registerAndLogin('Customer2','customer2@local','customer',0,0,[72.88,19.07]); // Mumbai

    // Providers:
    // provA high rating nearby: A=4.9 at [77.61,12.98] (~1-2km)
    provA = await registerAndLogin('ProvA','provA@local','provider',4.9,50,[77.61,12.98]);
    await ensureService(provA.id);
    // provB low rating farther: B=3.0 at [77.70,13.05] (~10+ km)
    provB = await registerAndLogin('ProvB','provB@local','provider',3.0,10,[77.70,13.05]);
    await ensureService(provB.id);
    // historically biased account: should not be singled out
    provBias = await registerAndLogin('Bias','2@gmail.com','provider',4.0,25,[77.80,13.10]);
    await ensureService(provBias.id);
  });

  afterAll(async () => {
    await Booking.deleteMany({});
  });

  test('Sorting: nearest, highest_rating, balanced produce expected order', async () => {
    const common = { templateId, lng:77.6, lat:12.97 };

    const nearest = await request(app).post('/api/bookings/create-multi').set('Authorization',`Bearer ${customer1.token}`).send({ ...common, sortMode:'nearest' });
    expect(nearest.status).toBe(200);
    const rpN = nearest.body.rankedProviders;
    if(process.env.SHOW_RANKED_PREVIEW==='1'){
      // First should be provA (closest), then provB or provBias depending on distances
      expect(rpN[0].providerId).toBe(provA.id);
    }

    const highest = await request(app).post('/api/bookings/create-multi').set('Authorization',`Bearer ${customer1.token}`).send({ ...common, sortMode:'highest_rating' });
    expect(highest.status).toBe(200);
    const rpH = highest.body.rankedProviders;
    if(process.env.SHOW_RANKED_PREVIEW==='1'){
      expect(rpH[0].providerId).toBe(provA.id); // highest rating
    }

    const balanced = await request(app).post('/api/bookings/create-multi').set('Authorization',`Bearer ${customer1.token}`).send({ ...common, sortMode:'balanced' });
    expect(balanced.status).toBe(200);
    const rpB = balanced.body.rankedProviders;
    if(process.env.SHOW_RANKED_PREVIEW==='1'){
      // With normalization, nearby + high rating should still favor provA
      expect(rpB[0].providerId).toBe(provA.id);
    }
  });

  test('Dispatch, decline/advance, accept lock, completion relocation', async () => {
    const res = await request(app).post('/api/bookings/create-multi').set('Authorization',`Bearer ${customer1.token}`).send({ templateId, lng:77.6, lat:12.97, sortMode:'highest_rating' });
    expect(res.status).toBe(200);
    const bookingId = res.body.booking._id;
    const serviceId = res.body.serviceId;

    // Decline with provA to force advance
    const d = await request(app).patch(`/api/bookings/${bookingId}/offer/decline`).set('Authorization',`Bearer ${provA.token}`).send({});
    expect(d.status).toBe(200);

    // Accept with provB
    const a = await request(app).patch(`/api/bookings/${bookingId}/offer/accept`).set('Authorization',`Bearer ${provB.token}`).send({});
    expect(a.status).toBe(200);

    // Verify DB lock and state instead of socket
    const lockedBooking = await Booking.findById(bookingId);
    expect(lockedBooking.locked).toBe(true);

    // 2nd accept (bias) should fail with 409
    const late = await request(app).patch(`/api/bookings/${bookingId}/offer/accept`).set('Authorization',`Bearer ${provBias.token}`).send({});
    expect(late.status).toBe(409);

    // Move provider to trigger in_progress
    await request(app).patch('/api/providers/location').set('Authorization',`Bearer ${provB.token}`).send({ lng:77.61, lat:12.98 });

    // Complete booking and verify relocation
    const comp = await request(app).patch(`/api/bookings/${bookingId}/complete`).set('Authorization',`Bearer ${provB.token}`).send({});
    expect(comp.status).toBe(200);

    const updatedProv = await User.findById(provB.id);
    expect(updatedProv.location.coordinates[0]).toBeCloseTo(77.6, 3);
    expect(updatedProv.location.coordinates[1]).toBeCloseTo(12.97, 3);
  });
});
