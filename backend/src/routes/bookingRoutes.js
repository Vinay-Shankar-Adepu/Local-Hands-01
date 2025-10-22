import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/authMiddleware.js";
import {
  createBooking,
  createBookingMulti,
  acceptBooking,
  rejectBooking,
  completeBooking,
  customerCompleteBooking,
  myBookings,
  cancelBooking,
  acceptOffer,
  declineOffer,
  myOffers,
  forceAdvanceOffer,
  getPendingCount,
  providerAvailableBookings,
  markCompleteWithBill,  // ✅ new controller
  getBookingById          // ✅ useful for frontend re-fetching latest state
} from "../controllers/bookingController.js";

const router = Router();

//
// 🧾 Static routes (non-ID based)
//
router.post("/create", requireAuth, requireRole("customer"), createBooking);
router.post("/create-multi", requireAuth, requireRole("customer"), createBookingMulti);
router.get("/mine", requireAuth, myBookings);
router.get("/pending-count", requireAuth, requireRole("provider"), getPendingCount);
router.get("/offers/mine", requireAuth, requireRole("provider"), myOffers);
router.get("/available", requireAuth, requireRole("provider"), providerAvailableBookings);

//
// 🔍 Utility route (fetch booking by ID for frontend updates)
//
router.get("/:id", requireAuth, getBookingById);

//
// ⚙️ Dynamic routes (actions on booking by ID)
//
router.patch("/:id/offer/accept", requireAuth, requireRole("provider"), acceptOffer);
router.patch("/:id/offer/decline", requireAuth, requireRole("provider"), declineOffer);
router.patch("/:id/offer/force-advance", requireAuth, requireRole("admin"), forceAdvanceOffer);
router.patch("/:id/accept", requireAuth, requireRole("provider"), acceptBooking);
router.patch("/:id/reject", requireAuth, requireRole("provider"), rejectBooking);

//
// ✅ New — Provider marks job complete & adds optional extra charges
//
router.patch("/:id/mark-complete", requireAuth, requireRole("provider"), markCompleteWithBill);

//
// 🏁 Customer confirms completion (after payment done)
//
router.patch("/:id/customer-complete", requireAuth, requireRole("customer"), customerCompleteBooking);

//
// 🚫 Cancel booking (customer only)
//
router.patch("/:id/cancel", requireAuth, requireRole("customer"), cancelBooking);

export default router;
