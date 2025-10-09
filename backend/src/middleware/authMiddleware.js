// src/middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import User from "../models/User.js";

/**
 * 🔐 Verify JWT token and attach user info to req.user
 */
export const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authentication token missing" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;
    req.userId = user._id.toString();
    req.userRole = user.role;

    next();
  } catch (err) {
    console.error("[verifyToken]", err.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

/**
 * 🛡️ Require specific roles
 * Example: router.get("/admin", verifyToken, requireRole("admin"), handler)
 */
export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.userRole || !roles.includes(req.userRole)) {
      return res.status(403).json({
        message: "You do not have permission to access this resource",
      });
    }
    next();
  };
};

/**
 * 👑 Require admin role
 * Example: router.get("/admin", verifyToken, isAdmin, handler)
 */
export const isAdmin = (req, res, next) => {
  if (req.userRole !== "admin") {
    return res.status(403).json({ message: "Admins only" });
  }
  next();
};

/**
 * 🧩 Compatibility alias
 * Ensures older code using `requireAuth` still works
 */
export const requireAuth = verifyToken;
export default verifyToken;
