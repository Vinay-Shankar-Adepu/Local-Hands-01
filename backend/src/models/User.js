import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String }, // optional if Google auth only
    phone: { type: String },
    googleId: { type: String },
    role: { type: String, enum: ["customer", "provider", "admin", null], default: null },
    verified: { type: Boolean, default: false },
    // Provider related fields
    isAvailable: { type: Boolean, default: false },
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], default: [0, 0] } // [lng, lat]
    },
    documents: [{ type: String }],
    selfie: { type: String },
    otpVerified: { type: Boolean, default: false },
    onboardingStatus: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    rating: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    completedJobs: { type: Number, default: 0 },
  // Customer specific
  address: { type: String }
  },
  { timestamps: true }
);

// helpful indexes (avoid duplicates with unique fields)
userSchema.index({ location: "2dsphere" });
userSchema.index({ rating: -1 });
userSchema.index({ completedJobs: -1 });

const User = mongoose.model("User", userSchema);
export default User;
