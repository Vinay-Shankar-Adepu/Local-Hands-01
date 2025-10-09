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
import verificationRoutes from './routes/verificationRoutes.js'; // ✅ new
import Booking from './models/Booking.js';

dotenv.config();

// ---------------- Database Init ----------------
connectDB().then(async () => {
  if (process.env.NODE_ENV !== 'test') {
    await ensureAdmin();
    await ensureCatalog();
  }
});

const app = express();

// ---------------- Middlewares ----------------
app.use(cors());
app.use(express.json({ limit: '10mb' })); // allow large base64 payloads
app.use(morgan('dev'));

// ✅ Serve static uploaded DL images (for admin preview)
app.use('/uploads', express.static('uploads'));

// ---------------- Routes ----------------
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
app.use('/api/verification', verificationRoutes); // ✅ new line

app.get('/', (_req, res) => res.send('🚀 LocalHands API (app export)'));

// ---------------- Background Expiry Worker ----------------
setInterval(async () => {
  const now = new Date();
  try {
    const candidates = await Booking.find({
      overallStatus: 'pending',
      pendingExpiresAt: { $lte: now },
    }).limit(50);

    for (const b of candidates) {
      if (b.providerResponses && b.providerResponses.some((r) => r.status === 'accepted')) continue;
      b.overallStatus = 'expired';
      b.autoAssignMessage = 'Request expired (no provider accepted in time).';
      await b.save();
      console.log('[booking-expire] Booking %s expired after 5m window', b._id);
    }
  } catch (err) {
    console.error('[booking-expire] error', err.message);
  }
}, 60 * 1000); // run every minute

export default app;
