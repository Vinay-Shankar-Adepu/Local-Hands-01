import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import User from "../models/User.js";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const signToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

// 🔹 Register with email/password
export const register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: "Missing fields" });

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "Email already in use" });

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hash, phone });

    const token = signToken(user);
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        verified: user.verified,
        phone: user.phone || "",
        address: user.address || "",
        isAvailable: user.isAvailable || false,
        rating: user.rating || 0,
        completedJobs: user.completedJobs || 0
      },
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// 🔹 Login with email/password
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !user.password)
      return res.status(400).json({ message: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ message: "Invalid credentials" });

    const token = signToken(user);
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        verified: user.verified,
        phone: user.phone || "",
        address: user.address || "",
        isAvailable: user.isAvailable || false,
        rating: user.rating || 0,
        completedJobs: user.completedJobs || 0
      },
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// 🔹 Login/Register with Google ID token
export const googleSignIn = async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) return res.status(400).json({ message: "Missing idToken" });

    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { sub: googleId, email, name } = payload;

    let user = await User.findOne({ email });

    if (!user) {
      // First-time Google user → no role yet
      user = await User.create({
        name,
        email,
        googleId,
        role: null,
      });
    } else if (!user.googleId) {
      // Existing user, link Google
      user.googleId = googleId;
      await user.save();
    }

    const token = signToken(user);
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        verified: user.verified,
        phone: user.phone || "",
        address: user.address || "",
        isAvailable: user.isAvailable || false,
        rating: user.rating || 0,
        completedJobs: user.completedJobs || 0
      },
    });
  } catch (e) {
    res.status(401).json({ message: "Google auth failed", error: e.message });
  }
};

// 🔹 Set role after first login
export const setRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!["customer", "provider", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      { role },
      { new: true }
    ).select("-password");

    const token = signToken(user);
    const needsServiceSelection = role === 'provider';
  res.json({ token, user: { ...user.toObject(), needsServiceSelection, isAvailable: user.isAvailable || false, rating: user.rating || 0, completedJobs: user.completedJobs || 0 } });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// 🔹 Get current user profile
export const me = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        verified: user.verified,
        phone: user.phone || "",
        address: user.address || "",
        isAvailable: user.isAvailable || false,
        rating: user.rating || 0,
        completedJobs: user.completedJobs || 0
      },
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// 🔹 Change Password
export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: "Please provide both old and new passwords" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if user has a password (not Google-only)
    if (!user.password) {
      return res.status(400).json({ 
        message: "Cannot change password for Google sign-in accounts. Please use Google to manage your password." 
      });
    }

    // Verify old password
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Hash new password
    const hash = await bcrypt.hash(newPassword, 10);
    user.password = hash;
    await user.save();

    res.json({ 
      message: "Password updated successfully",
      success: true 
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
