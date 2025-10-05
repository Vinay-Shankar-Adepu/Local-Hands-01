import { Router } from "express";
import multer from 'multer';
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

// Allow up to 5MB per image, max 5 images (prototype only; production should use external storage)
// Use memory storage so we can transform to base64 placeholder (no disk cleanup needed)
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024, files: 5 } });

// Customer rates provider (supports JSON or multipart with images[])
router.post("/provider", requireAuth, requireRole("customer"), upload.array('images',5), async (req, res) => {
  try {
    const body = req.body || {};
    let { bookingId, rating, comment = "", optionalMessage = "" } = body;
    // Multer error scenario could leave body undefined; guard
    if (bookingId === undefined && !req.files?.length) {
      return res.status(400).json({ message: 'Invalid submission: no form fields received (possible file too large or network issue).' });
    }
    // Convert numeric rating if sent as string
    if (typeof rating === 'string') rating = Number(rating);
    const workImagesBody = req.body.workImages; // JSON variant (array or single)
    let workImages = [];
    if (req.files && req.files.length) {
      // Convert each in-memory file buffer to base64 data URL; skip if buffer missing
      workImages = req.files.map(f => {
        try {
          if(!f.buffer) return null; // disk storage fallback just in case
          return `data:${f.mimetype};base64,${f.buffer.toString('base64')}`;
        } catch(e){ return null; }
      }).filter(Boolean);
    } else if (workImagesBody) {
      try {
        if (typeof workImagesBody === 'string') {
          const parsed = JSON.parse(workImagesBody);
          if (Array.isArray(parsed)) workImages = parsed;
        } else if (Array.isArray(workImagesBody)) {
          workImages = workImagesBody;
        }
      } catch { /* ignore parse errors */ }
    }
    if (!bookingId || !rating) return res.status(400).json({ message: "bookingId & rating required" });
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (booking.customer.toString() !== req.userId) return res.status(403).json({ message: "Not your booking" });
    if (booking.status !== "completed") return res.status(400).json({ message: "Booking not completed" });
    if (booking.customerRating || booking.customerReviewed) return res.status(400).json({ message: "Already rated provider" });

    await Review.create({ 
      booking: booking._id, 
      customer: booking.customer, 
      provider: booking.provider, 
      rating, 
      comment, 
      optionalMessage,
  workImages: Array.isArray(workImages) ? workImages.slice(0,5) : [],
      direction: "customer_to_provider",
      isHiddenFromGiver: true,
      isPublic: true
    });
    booking.customerRating = rating;
    booking.customerReviewed = true;
    
    // Update review status
    if (booking.providerReviewed) {
      booking.reviewStatus = "fully_closed";
    } else {
      booking.reviewStatus = "both_pending"; // Now provider needs to review
    }
    
    await booking.save();
    if (booking.provider) {
      await applyNewRating(booking.provider, rating);
      
      // Notify provider about review (mention optional message if provided)
      const notifMessage = optionalMessage 
        ? `You received a ${rating}-star rating and a message from a customer.`
        : `You received a ${rating}-star rating from a customer.`;
        
      await Notification.create({
        user: booking.provider,
        fromUser: booking.customer,
        type: 'rating_received',
        booking: booking._id,
        message: notifMessage
      });
    }
    res.status(201).json({ 
      message: "Rating saved", 
      reviewStatus: booking.reviewStatus,
      triggerProviderReview: !booking.providerReviewed,
      bookingId: booking._id
    });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// Provider rates customer
router.post("/customer", requireAuth, requireRole("provider"), async (req, res) => {
  try {
    const { bookingId, rating, comment = "", optionalMessage = "" } = req.body;
    if (!bookingId || !rating) return res.status(400).json({ message: "bookingId & rating required" });
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (booking.provider?.toString() !== req.userId) return res.status(403).json({ message: "Not your booking" });
    if (booking.status !== "completed") return res.status(400).json({ message: "Booking not completed" });
    if (booking.providerRating || booking.providerReviewed) return res.status(400).json({ message: "Already rated customer" });

    await Review.create({ 
      booking: booking._id, 
      customer: booking.customer, 
      provider: booking.provider, 
      rating, 
      comment,
      optionalMessage,
      direction: "provider_to_customer",
      isHiddenFromGiver: true,
      isPublic: true
    });
    booking.providerRating = rating;
    booking.providerReviewed = true;
    
    // Update review status
    if (booking.customerReviewed) {
      booking.reviewStatus = "fully_closed";
    } else {
      booking.reviewStatus = "both_pending"; // Customer still needs to review
    }
    
    await booking.save();
    if (booking.customer) {
      await applyNewRating(booking.customer, rating);
      
      // Notify customer about review (mention optional message if provided)
      const notifMessage = optionalMessage
        ? `You received a ${rating}-star rating and a message from a provider.`
        : `You received a ${rating}-star rating from a provider.`;
        
      await Notification.create({
        user: booking.customer,
        fromUser: booking.provider,
        type: 'rating_received',
        booking: booking._id,
        message: notifMessage
      });
    }
    res.status(201).json({ 
      message: "Rating saved",
      reviewStatus: booking.reviewStatus,
      bookingId: booking._id
    });
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
