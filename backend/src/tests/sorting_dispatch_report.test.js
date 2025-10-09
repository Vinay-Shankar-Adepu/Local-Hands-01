/**
 * Sorting & Dispatch Report (Deterministic Accounts)
 * Accounts:
 * - customer1@gmail.com (Customer)
 * - providerA@gmail.com, providerB@gmail.com, providerC@gmail.com, providerD@gmail.com (Providers)
 *
 * Skipped by default. Run with RUN_SORTING_REPORT=1 to enable:
 *   RUN_SORTING_REPORT=1 SHOW_RANKED_PREVIEW=1 npm test -- --runInBand
 */

const shouldRun = process.env.RUN_SORTING_REPORT === '1';
const d = shouldRun ? describe : describe.skip;

import request from 'supertest';
import app from '../../src/app.js';
import mongoose from 'mongoose';
import User from '../../src/models/User.js';
import ServiceTemplate from '../../src/models/ServiceTemplate.js';
import Service from '../../src/models/Service.js';
import Booking from '../../src/models/Booking.js';
import Category from '../../src/models/Category.js';

// Note: backend stores coordinates as [lng, lat]
const CUST_LAT = 12.9700;
const CUST_LNG = 77.5900;

function haversineKm(lat1,lng1,lat2,lng2){
  const R=6371; const dLat=(lat2-lat1)*Math.PI/180; const dLng=(lng2-lng1)*Math.PI/180;
  const a=Math.sin(dLat/2)**2+Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2; const c=2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
  return R*c;
}

async function registerAndLogin(name,email,role){
  const reg = await request(app).post('/api/auth/register').send({ name, email, password: 'pass123', role });
  if(reg.status !== 200) throw new Error(`Registration failed for ${email}: ${reg.status} ${JSON.stringify(reg.body)}`);
  const login = await request(app).post('/api/auth/login').send({ email, password: 'pass123' });
  if(login.status !== 200) throw new Error(`Login failed for ${email}: ${login.status} ${JSON.stringify(login.body)}`);
  return { id: login.body.user.id, token: login.body.token };
}

async function ensureTemplate(name){
  let tpl = await ServiceTemplate.findOne({ name });
  if(!tpl){ 
    let cat = await Category.findOne({ name: 'Home' });
    if(!cat) cat = await Category.create({ name: 'Home', slug: 'home', active: true });
    tpl = await ServiceTemplate.create({ name, category: cat._id, defaultPrice: 100, active: true }); 
  }
  return tpl;
}

async function ensureService(providerId, templateId){
  let svc = await Service.findOne({ provider: providerId, template: templateId });
  if(!svc){ 
    let cat = await Category.findOne({ name: 'Home' });
    if(!cat) cat = await Category.create({ name: 'Home', slug: 'home', active: true });
    svc = await Service.create({ name: 'Plumbing', category: cat._id, price: 100, provider: providerId, template: templateId, lockedPrice: true }); 
  }
  return svc;
}

function balancedScoreNormalized(distanceKm, rating, maxDist){
  const normDist = maxDist > 0 ? (distanceKm / maxDist) : 0; // 0..1 (lower better)
  const normRating = (rating || 0) / 5; // 0..1 (higher better)
  // App formula sorts ascending, so invert rating: (dist*0.7) + ((1 - normRating)*0.3)
  return (normDist * 0.7) + ((1 - normRating) * 0.3);
}

d('Sorting & Dispatch Report', () => {
  let customer, provA, provB, provC, provD, templateId;

  beforeAll(async()=>{
    if(!process.env.MONGO_URI) process.env.MONGO_URI = 'mongodb://127.0.0.1:27017/localhands_test';
    if(mongoose.connection.readyState === 0) await mongoose.connect(process.env.MONGO_URI);
    // Clean up any prior users with same emails for deterministic run
    await User.deleteMany({ email: { $in: ['customer1@gmail.com','providerA@gmail.com','providerB@gmail.com','providerC@gmail.com','providerD@gmail.com'] } });
    await Booking.deleteMany({});

    customer = await registerAndLogin('Customer1','customer1@gmail.com','customer');
    // Seed provider accounts
    provA = await registerAndLogin('ProvA','providerA@gmail.com','provider');
    provB = await registerAndLogin('ProvB','providerB@gmail.com','provider');
    provC = await registerAndLogin('ProvC','providerC@gmail.com','provider');
    provD = await registerAndLogin('ProvD','providerD@gmail.com','provider');

    // Ratings & deterministic coords within ~2km
    const providers = [
      { h: provA, rating: 4.8, lat: 12.9721, lng: 77.5912 },
      { h: provB, rating: 3.5, lat: 12.9698, lng: 77.5920 },
      { h: provC, rating: 4.2, lat: 12.9655, lng: 77.5931 },
      { h: provD, rating: 2.8, lat: 12.9730, lng: 77.5950 },
    ];
    for(const p of providers){
      if(!p.h || !p.h.id){
        console.error('[beforeAll] Invalid provider handle:', p);
        throw new Error('Provider handle missing id');
      }
      const updated = await User.findByIdAndUpdate(p.h.id, {
        isAvailable: true,
        rating: p.rating, ratingCount: Math.floor(p.rating*10),
        location: { type: 'Point', coordinates: [p.lng, p.lat] }
      }, { new: true });
      if(!updated){
        console.error('[beforeAll] Failed to update provider with id:', p.h.id);
        throw new Error(`Provider update failed for ${p.h.id}`);
      }
      console.log('[beforeAll] Updated provider:', updated.email, 'rating=', updated.rating, 'coords=', updated.location.coordinates);
    }

    // Ensure template and services
    const tpl = await ensureTemplate('Plumbing');
    templateId = tpl._id.toString();
    
    // Providers select template to create services
    for(const p of [provA, provB, provC, provD]){
      await request(app).post('/api/providers/select-services').set('Authorization',`Bearer ${p.token}`).send({ templateIds:[templateId] });
    }
  }, 60000);

  afterAll(async()=>{
    // keep data for inspection; optionally disconnect
    if(mongoose.connection.readyState !== 0){
      await mongoose.disconnect();
    }
  });

  async function runMode(sortMode){
    const body = { templateId, lng: CUST_LNG, lat: CUST_LAT, sortMode };
    const res = await request(app).post('/api/bookings/create-multi').set('Authorization',`Bearer ${customer.token}`).send(body);
    if(res.status !== 200){
      console.error('[runMode] Error creating booking:', res.status, res.body);
    }
    expect(res.status).toBe(200);
    const booking = res.body.booking;

    // Gather current providers from DB to compute order
    const docs = await User.find({ email: { $in: ['providerA@gmail.com','providerB@gmail.com','providerC@gmail.com','providerD@gmail.com'] } }).lean();
    const enriched = docs.map(d=>{
      const [lng,lat] = d.location?.coordinates || [0,0];
      const dist = haversineKm(CUST_LAT, CUST_LNG, lat, lng);
      return { id: d._id.toString(), name: d.name, email: d.email, rating: d.rating || 0, distanceKm: Number(dist.toFixed(3)) };
    });

    let providerOrder;
    if(sortMode==='nearest'){
      providerOrder = enriched.sort((a,b)=> a.distanceKm - b.distanceKm);
    } else if(sortMode==='highest_rating'){
      providerOrder = enriched.sort((a,b)=> (b.rating - a.rating) || (a.distanceKm - b.distanceKm));
    } else if(sortMode==='balanced'){
      const maxDist = enriched.reduce((m,e)=> e.distanceKm > m ? e.distanceKm : m, 0);
      providerOrder = enriched.map(e=> ({ ...e, balancedScore: Number(balancedScoreNormalized(e.distanceKm, e.rating, maxDist).toFixed(4)) }))
        .sort((a,b)=> (a.balancedScore - b.balancedScore) || (b.rating - a.rating));
    } else {
      throw new Error('Unsupported sortMode');
    }

    const dispatchedProviderId = booking.offers?.[0]?.provider?.toString() || null;
    const dispatched = providerOrder.find(p=> p.id === dispatchedProviderId);
    const expectedTop = providerOrder[0];

    // Report block
    const report = {
      mode: sortMode,
      providerOrder: providerOrder.map(p=>({ name: p.name, email: p.email, distance: p.distanceKm, rating: p.rating, balancedScore: p.balancedScore })),
      dispatchedTo: dispatched?.name || null,
      expectedTop: expectedTop?.name || null,
      status: (dispatched && expectedTop && dispatched.id === expectedTop.id) ? 'PASS' : 'FAIL'
    };
    // Log structured JSON for collection
    // eslint-disable-next-line no-console
    console.log('[REPORT]', JSON.stringify(report));

    // Assertions
    expect(dispatchedProviderId).toBe(expectedTop.id);

    return { report, bookingId: booking._id };
  }

  test('Mode: nearest', async()=>{ await runMode('nearest'); }, 30000);
  test('Mode: highest_rating', async()=>{ await runMode('highest_rating'); }, 30000);
  test('Mode: balanced (normalized)', async()=>{ await runMode('balanced'); }, 30000);

  test('Edge: turn off one provider and ensure they are not considered', async()=>{
    // Turn off providerD
    const dUser = await User.findOne({ email: 'providerD@gmail.com' });
    await User.findByIdAndUpdate(dUser._id, { isAvailable: false });
    const res = await request(app).post('/api/bookings/create-multi').set('Authorization',`Bearer ${customer.token}`).send({ templateId, lng: CUST_LNG, lat: CUST_LAT, sortMode: 'nearest' });
    expect(res.status).toBe(200);
    const offers = res.body.booking.offers;
    const allProviderIds = offers.map(o=> o.provider.toString());
    expect(allProviderIds).not.toContain(dUser._id.toString());
  }, 30000);

  test('Edge: move provider far away (>10km) and ensure sorting reacts', async()=>{
    // Reset providerC to deterministic nearby location first
    await User.findByIdAndUpdate(provC.id, { location: { type:'Point', coordinates: [77.5931, 12.9655] }, isAvailable: true });
    // Move providerC ~15km east (approx); with customer at (77.59, 12.97), moving to (77.80, 12.97) should be ~16km away
    await User.findByIdAndUpdate(provC.id, { location: { type:'Point', coordinates: [77.80, 12.97] } });
    const res = await request(app).post('/api/bookings/create-multi').set('Authorization',`Bearer ${customer.token}`).send({ templateId, lng: CUST_LNG, lat: CUST_LAT, sortMode: 'nearest' });
    expect(res.status).toBe(200);
    const firstId = res.body.booking.offers[0].provider.toString();
    const cUser = await User.findById(provC.id);
    // With nearest sort and providerC moved far away, the first dispatched should NOT be providerC
    // (one of A/B/D should be closer)
    expect(firstId).not.toBe(cUser._id.toString());
  }, 30000);

  test('Re-assignment on decline (no network for first provider simulated)', async()=>{
    const res = await request(app).post('/api/bookings/create-multi').set('Authorization',`Bearer ${customer.token}`).send({ templateId, lng: CUST_LNG, lat: CUST_LAT, sortMode: 'highest_rating' });
    expect(res.status).toBe(200);
    const bookingId = res.body.booking._id;
    const firstProvId = res.body.booking.offers[0].provider;
    const firstProv = await User.findById(firstProvId);
    // Decline immediately
    const login = await request(app).post('/api/auth/login').send({ email: firstProv.email, password: 'pass123' });
    const decline = await request(app).patch(`/api/bookings/${bookingId}/offer/decline`).set('Authorization',`Bearer ${login.body.token}`).send({});
    expect(decline.status).toBe(200);
    // Fetch booking again and ensure new pending offer exists for next provider
    const b = await Booking.findById(bookingId).lean();
    const pending = b.offers.find(o=> o.status==='pending');
    expect(pending).toBeTruthy();
    expect(pending.provider.toString()).not.toBe(firstProvId.toString());
  }, 30000);
});
