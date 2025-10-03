import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/authMiddleware.js";
import Booking from "../models/Booking.js";
import Review from "../models/Review.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";

const router = Router();

async function applyNewRating(userId, rating) {
  const u = await User.findById(userId).select("rating ratingCount");
  if (!u) return;
  const total = u.rating * u.ratingCount + rating;
  u.ratingCount += 1;
  u.rating = total / u.ratingCount;
  await u.save();
}

// Customer rates provider
router.post("/provider", requireAuth, requireRole("customer"), async (req, res) => {
  try {
    const { bookingId, rating, comment = "" } = req.body;
    if (!bookingId || !rating) return res.status(400).json({ message: "bookingId & rating required" });
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (booking.customer.toString() !== req.userId) return res.status(403).json({ message: "Not your booking" });
    if (booking.status !== "completed") return res.status(400).json({ message: "Booking not completed" });
    if (booking.customerRating) return res.status(400).json({ message: "Already rated provider" });

    await Review.create({ booking: booking._id, customer: booking.customer, provider: booking.provider, rating, comment, direction: "customer_to_provider" });
    booking.customerRating = rating;
    await booking.save();
    if (booking.provider) {
      await applyNewRating(booking.provider, rating);
      await Notification.create({
        user: booking.provider,
        fromUser: booking.customer,
        type: 'rating_received',
        booking: booking._id,
        message: `You received a ${rating}-star rating from a customer.`
      });
    }
    res.status(201).json({ message: "Rating saved" });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// Provider rates customer
router.post("/customer", requireAuth, requireRole("provider"), async (req, res) => {
  try {
    const { bookingId, rating, comment = "" } = req.body;
    if (!bookingId || !rating) return res.status(400).json({ message: "bookingId & rating required" });
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (booking.provider?.toString() !== req.userId) return res.status(403).json({ message: "Not your booking" });
    if (booking.status !== "completed") return res.status(400).json({ message: "Booking not completed" });
    if (booking.providerRating) return res.status(400).json({ message: "Already rated customer" });

    await Review.create({ booking: booking._id, customer: booking.customer, provider: booking.provider, rating, comment, direction: "provider_to_customer" });
    booking.providerRating = rating;
    await booking.save();
    if (booking.customer) {
      await applyNewRating(booking.customer, rating);
      await Notification.create({
        user: booking.customer,
        fromUser: booking.provider,
        type: 'rating_received',
        booking: booking._id,
        message: `You received a ${rating}-star rating from a provider.`
      });
    }
    res.status(201).json({ message: "Rating saved" });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// Rating summary for a user
router.get("/summary", requireAuth, async (req, res) => {
  try {
    const userId = req.query.userId || req.userId;
    const user = await User.findById(userId).select("rating ratingCount");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ rating: user.rating, ratingCount: user.ratingCount });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

export default router;
