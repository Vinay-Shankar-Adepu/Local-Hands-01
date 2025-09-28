import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/authMiddleware.js";
import { createBooking, acceptBooking, myBookings } from "../controllers/bookingController.js";

const router = Router();

router.post("/create", requireAuth, requireRole("customer"), createBooking);
router.patch("/:id/accept", requireAuth, requireRole("provider"), acceptBooking);
router.get("/mine", requireAuth, myBookings);

export default router;
