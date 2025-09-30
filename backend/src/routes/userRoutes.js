import { Router } from "express";
import { requireAuth } from "../middleware/authMiddleware.js";
import { updateProfile, getProfile, getCustomerPublic } from "../controllers/userController.js";

const router = Router();

router.get("/me", requireAuth, getProfile);
router.patch("/me", requireAuth, updateProfile);
router.get("/customer/:id", requireAuth, getCustomerPublic); // provider can view customer details of a booking later (light protection)

export default router;
