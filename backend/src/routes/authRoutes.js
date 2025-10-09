import { Router } from "express";
import { register, login, googleSignIn, setRole, me, changePassword, requestPasswordReset, verifyPasswordResetOtp, resetPasswordWithOtp } from "../controllers/authController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/google", googleSignIn);
router.post("/set-role", requireAuth, setRole);
router.get("/me", requireAuth, me);
router.post("/change-password", requireAuth, changePassword);
router.post('/forgot-password/request', requestPasswordReset);
router.post('/forgot-password/verify', verifyPasswordResetOtp);
router.post('/forgot-password/reset', resetPasswordWithOtp);

export default router;
