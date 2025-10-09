// src/middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Require valid JWT
export const requireAuth = async (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) {
      return res.status(401).json({ message: "Authentication token missing" });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.id).select("-password");
    if (!user) return res.status(401).json({ message: "User not found" });

    req.userId = user._id.toString();
    req.userRole = user.role;
    req.user = user;

    next();
  } catch (e) {
    console.error("Auth error:", e.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

// Require specific role(s)
export const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.userRole)) {
    return res.status(403).json({ message: "You do not have permission" });
  }
  next();
};
