import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/authMiddleware.js";
import {
  nearbyProviders,
  setAvailability,
  updateLocation,
  submitOnboarding
} from "../controllers/providerController.js";

const router = Router();

// public: discover providers near a point
router.get("/nearby", nearbyProviders);

// provider secured routes
router.patch("/availability", requireAuth, requireRole("provider"), setAvailability);
router.patch("/location", requireAuth, requireRole("provider"), updateLocation);
router.post("/onboarding", requireAuth, requireRole("provider"), submitOnboarding);

export default router;
