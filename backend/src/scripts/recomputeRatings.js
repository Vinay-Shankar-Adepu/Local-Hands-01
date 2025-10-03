import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Review from '../models/Review.js';
import connectDB from '../config/db.js';

dotenv.config();

async function run() {
  await connectDB();
  console.log('🔄 Recomputing ratings from reviews...');

  // Providers: ratings from customer_to_provider
  const providerAgg = await Review.aggregate([
    { $match: { direction: 'customer_to_provider' } },
    { $group: { _id: '$provider', count: { $sum: 1 }, avg: { $avg: '$rating' } } }
  ]);

  // Customers: ratings from provider_to_customer
  const customerAgg = await Review.aggregate([
    { $match: { direction: 'provider_to_customer' } },
    { $group: { _id: '$customer', count: { $sum: 1 }, avg: { $avg: '$rating' } } }
  ]);

  const ops = [];
  providerAgg.forEach(r => {
    if (!r._id) return;
    ops.push(User.updateOne({ _id: r._id }, { $set: { rating: r.avg, ratingCount: r.count } }));
  });
  customerAgg.forEach(r => {
    if (!r._id) return;
    ops.push(User.updateOne({ _id: r._id }, { $set: { rating: r.avg, ratingCount: r.count } }));
  });

  await Promise.all(ops);
  console.log(`✅ Updated ${ops.length} user rating records.`);

  // Reset users with no reviews to 0 if they had inflated values
  const reviewedIds = new Set([
    ...providerAgg.map(r => r._id?.toString()),
    ...customerAgg.map(r => r._id?.toString())
  ]);
  const toReset = await User.find({}).select('rating ratingCount');
  const resetOps = [];
  toReset.forEach(u => {
    if (!reviewedIds.has(u._id.toString()) && (u.rating !== 0 || u.ratingCount !== 0)) {
      resetOps.push(User.updateOne({ _id: u._id }, { $set: { rating: 0, ratingCount: 0 } }));
    }
  });
  if (resetOps.length) {
    await Promise.all(resetOps);
    console.log(`🧹 Reset ${resetOps.length} users with no reviews.`);
  }

  await mongoose.connection.close();
  console.log('🏁 Done.');
}

run().catch(e => { console.error(e); process.exit(1); });
