import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/authMiddleware.js";
import { createBooking, createBookingMulti, acceptBooking, rejectBooking, completeBooking, customerCompleteBooking, myBookings, cancelBooking, acceptOffer, declineOffer, myOffers, forceAdvanceOffer, getPendingCount } from "../controllers/bookingController.js";

const router = Router();

// Static routes first (before dynamic :id routes)
router.post("/create", requireAuth, requireRole("customer"), createBooking);
router.post("/create-multi", requireAuth, requireRole("customer"), createBookingMulti);
router.get("/mine", requireAuth, myBookings);
router.get("/pending-count", requireAuth, requireRole("provider"), getPendingCount);
router.get('/offers/mine', requireAuth, requireRole('provider'), myOffers);

// Dynamic routes last
router.patch('/:id/offer/accept', requireAuth, requireRole('provider'), acceptOffer);
router.patch('/:id/offer/decline', requireAuth, requireRole('provider'), declineOffer);
router.patch('/:id/offer/force-advance', requireAuth, requireRole('admin'), forceAdvanceOffer);
router.patch("/:id/accept", requireAuth, requireRole("provider"), acceptBooking);
router.patch("/:id/reject", requireAuth, requireRole("provider"), rejectBooking);
router.patch("/:id/complete", requireAuth, requireRole("provider"), completeBooking);
router.patch(":id/customer-complete", requireAuth, requireRole("customer"), customerCompleteBooking);
router.patch("/:id/cancel", requireAuth, requireRole("customer"), cancelBooking);
// In future could be filtered; for now rely on /mine with status filter client side

export default router;
