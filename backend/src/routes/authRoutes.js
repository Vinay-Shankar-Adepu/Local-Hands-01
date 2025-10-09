import { Router } from "express";
import {
  register,
  login,
  googleSignIn,
  setRole,
  me,
  changePassword,
  requestPasswordReset,
  verifyPasswordResetOtp,
  resetPasswordWithOtp,
} from "../controllers/authController.js";

import { verifyToken } from "../middleware/authMiddleware.js";

const router = Router();

// Public routes
router.post("/register", register);
router.post("/login", login);
router.post("/google", googleSignIn);
router.post("/forgot-password/request", requestPasswordReset);
router.post("/forgot-password/verify", verifyPasswordResetOtp);
router.post("/forgot-password/reset", resetPasswordWithOtp);

// Authenticated routes
router.post("/set-role", verifyToken, setRole);
router.get("/me", verifyToken, me);
router.post("/change-password", verifyToken, changePassword);

export default router;
