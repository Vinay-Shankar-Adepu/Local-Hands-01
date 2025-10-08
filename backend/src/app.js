import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import { ensureAdmin } from './utils/bootstrapAdmin.js';
import { ensureCatalog } from './utils/bootstrapCatalog.js';

import authRoutes from './routes/authRoutes.js';
import providerRoutes from './routes/providerRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import serviceRoutes from './routes/serviceRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import userRoutes from './routes/userRoutes.js';
import ratingsRoutes from './routes/ratingsRoutes.js';
import notificationsRoutes from './routes/notificationsRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import catalogRoutes from './routes/catalogRoutes.js';
import serviceAggregateRoutes from './routes/serviceAggregateRoutes.js';
import Booking from './models/Booking.js';
import { seedTestCatalog } from './utils/seedTestCatalog.js';
import mongoose from 'mongoose';

dotenv.config();
// In test environment the test harness establishes the Mongo connection manually (beforeAll).
// Avoid connecting twice (which pointed to production .env previously) to keep isolation.
if (!(process.env.NODE_ENV === 'test' || process.env.JEST_WORKER_ID)) {
  connectDB().then(async ()=>{
    await ensureAdmin();
    await ensureCatalog();
  });
}

const app = express();
app.use(cors());
// Increase JSON limit to allow base64-embedded work images (lightweight proofs)
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));

app.use('/api/auth', authRoutes);
app.use('/api/providers', providerRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ratings', ratingsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/catalog', catalogRoutes);
app.use('/api/service-aggregate', serviceAggregateRoutes);

app.get('/', (_req,res)=>res.send('🚀 LocalHands API (app export)'));

// Background interval: expire global pending bookings after 5 minutes
if(!(process.env.NODE_ENV === 'test' || process.env.JEST_WORKER_ID)) {
  setInterval(async ()=>{
	const now = new Date();
	try {
		const candidates = await Booking.find({ overallStatus: 'pending', pendingExpiresAt: { $lte: now } }).limit(50);
		for(const b of candidates){
			if(b.providerResponses && b.providerResponses.some(r=>r.status==='accepted')) continue;
			b.overallStatus = 'expired';
			b.autoAssignMessage = 'Request expired (no provider accepted in time).';
			await b.save();
			console.log('[booking-expire] Booking %s expired after 5m window', b._id);
		}
	} catch(err){
		console.error('[booking-expire] error', err.message);
	}
  }, 60*1000);

	// Daily lightweight offer cleanup: prune very old expired/declined offers arrays to keep documents small
	setInterval(async ()=>{
		const cutoff = new Date(Date.now() - 24*60*60*1000);
		try {
			const old = await Booking.find({ 'offers.respondedAt': { $lte: cutoff } }).limit(200);
			for(const b of old){
				const before = b.offers.length;
				b.offers = b.offers.filter(o=> !(o.respondedAt && o.respondedAt < cutoff && (o.status==='declined' || o.status==='expired')));
				if(before !== b.offers.length){
					await b.save();
					console.log('[offer-cleanup] booking=%s trimmed %d -> %d', b._id, before, b.offers.length);
				}
			}
		} catch(err){ console.error('[offer-cleanup] error', err.message); }
	}, 6*60*60*1000); // every 6 hours
}

// Lightweight test bootstrap (tests connect DB themselves beforehand)
if (process.env.NODE_ENV === 'test' || process.env.JEST_WORKER_ID) {
	// Attempt a lazy connection only if not already connected (tests may connect manually)
	if(mongoose.connection.readyState === 0 && process.env.MONGO_URI){
		connectDB().then(()=> seedTestCatalog());
	} else {
		// If tests connect after, allow them to call seeding by re-importing this file; also schedule a backup attempt
		setTimeout(()=>{ seedTestCatalog(); }, 25);
	}
}

export default app;