import { Router } from "express";
import Review from "../models/Review.js";
import Booking from "../models/Booking.js";
import User from "../models/User.js";
import { requireAuth, requireRole } from "../middleware/authMiddleware.js";

const router = Router();

// Create review (customer after completion)
router.post("/:bookingId", requireAuth, requireRole("customer"), async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { rating, comment = "" } = req.body;
    if (!rating) return res.status(400).json({ message: "rating required" });
    const booking = await Booking.findById(bookingId).populate("service");
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (booking.customer.toString() !== req.userId) return res.status(403).json({ message: "Not your booking" });
    if (booking.status !== "completed") return res.status(400).json({ message: "Booking not completed" });

    const exists = await Review.findOne({ booking: booking._id });
    if (exists) return res.status(400).json({ message: "Already reviewed" });

    const providerId = booking.provider;
    const review = await Review.create({ booking: booking._id, customer: req.userId, provider: providerId, rating, comment, direction: "customer_to_provider" });

    // Properly update provider aggregate rating (average)
    const prov = await User.findById(providerId).select("rating ratingCount");
    if (prov) {
      const total = prov.rating * prov.ratingCount + rating;
      prov.ratingCount += 1;
      prov.rating = total / prov.ratingCount;
      await prov.save();
    }

    res.status(201).json({ review });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// List provider reviews
router.get("/provider/:providerId", async (req, res) => {
  try {
    const { providerId } = req.params;
    const reviews = await Review.find({ provider: providerId }).sort("-createdAt");
    res.json({ reviews });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

export default router;
