import express from "express";
import {
  uploadDL,
  getVerificationStatus,
  getPendingVerifications,
  approveVerification,
  rejectVerification,
  upload,
} from "../controllers/verificationController.js";

import { verifyToken } from "../middleware/authMiddleware.js";
import { isAdmin } from "../middleware/adminMiddleware.js";

const router = express.Router();

/* ------------------------------------------------------------------
 🧾  PROVIDER ROUTES (protected by JWT)
-------------------------------------------------------------------*/

// 📤 Upload DL/selfie for verification
// Expects field name: "dlImage"
router.post("/upload", verifyToken, upload.single("dlImage"), uploadDL);

// 📋 Get current verification status
router.get("/status", verifyToken, getVerificationStatus);

/* ------------------------------------------------------------------
 🛡️  ADMIN ROUTES (protected by JWT + admin role)
-------------------------------------------------------------------*/

// 🧾 List all pending/rejected verifications
router.get("/list", verifyToken, isAdmin, getPendingVerifications);

// ✅ Approve provider
router.put("/:id/approve", verifyToken, isAdmin, approveVerification);

// ❌ Reject provider
router.put("/:id/reject", verifyToken, isAdmin, rejectVerification);

export default router;
