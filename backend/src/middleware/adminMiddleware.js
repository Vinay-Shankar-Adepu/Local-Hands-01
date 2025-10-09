import jwt from "jsonwebtoken";
import User from "../models/User.js";

/**
 * ✅ Middleware: Checks if request comes from an authenticated admin.
 * Use it with `verifyToken` before it, or combine both into one.
 */
export const isAdmin = async (req, res, next) => {
  try {
    // The verifyToken middleware already attaches req.user if valid.
    // But if not, check again.
    const user = req.user;
    if (!user) {
      // Fallback in case verifyToken not run yet
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith("Bearer ")) {
        return res.status(401).json({ message: "No token provided" });
      }
      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const foundUser = await User.findById(decoded.id);
      if (!foundUser) {
        return res.status(404).json({ message: "User not found" });
      }
      if (foundUser.role !== "admin") {
        return res.status(403).json({ message: "Access denied (Admins only)" });
      }
      req.user = foundUser;
      return next();
    }

    if (user.role !== "admin") {
      return res.status(403).json({ message: "Access denied (Admins only)" });
    }

    next();
  } catch (err) {
    console.error("[isAdmin]", err.message);
    return res.status(401).json({ message: "Unauthorized" });
  }
};
