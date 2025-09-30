import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/authMiddleware.js";
import { createBooking, acceptBooking, rejectBooking, myBookings } from "../controllers/bookingController.js";

const router = Router();

router.post("/create", requireAuth, requireRole("customer"), createBooking);
router.patch("/:id/accept", requireAuth, requireRole("provider"), acceptBooking);
router.patch("/:id/reject", requireAuth, requireRole("provider"), rejectBooking);
router.get("/mine", requireAuth, myBookings);
// In future could be filtered; for now rely on /mine with status filter client side

export default router;
