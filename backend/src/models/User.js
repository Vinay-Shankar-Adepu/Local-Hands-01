// src/routes/user.js
import express from "express";
import User from "../models/User.js";
import { requireAuth, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

// Save or update user role
router.post("/set-role", requireAuth, async (req, res) => {
  try {
    const { role } = req.body;
    if (!["customer", "provider", "admin"].includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }

    const user = await User.findByIdAndUpdate(
      req.userId,  // comes from requireAuth
      { role },
      { new: true }
    ).select("-password");

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to set role" });
  }
});

export default router;
