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
    lastServiceLocation: {
      type: { type: String, enum: ["Point"] },
      coordinates: { type: [Number] } // Last completed service location
    },
    lastServiceCompletedAt: { type: Date }, // Timestamp of last completed service
    isLiveTracking: { type: Boolean, default: false }, // Whether actively sending live location updates
    documents: [{ type: String }],
    selfie: { type: String },
    otpVerified: { type: Boolean, default: false },
    // Provider verification system
    onboardingStatus: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    licenseImage: { type: String }, // URL/path to uploaded license (Aadhar/PAN/DL)
    licenseType: { type: String, enum: ["aadhar", "pan", "driving_license", "other"] },
    licenseNumber: { type: String }, // Optional: provider can enter license number
    verificationSubmittedAt: { type: Date }, // When provider submitted verification
    verificationReviewedAt: { type: Date }, // When admin reviewed
    verificationReviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Admin who reviewed
    rejectionReason: { type: String }, // Why admin rejected (if rejected)
    rating: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    completedJobs: { type: Number, default: 0 },
    // Customer specific
    address: { type: String },
    preciseAddress: { type: String }, // For remote/rural locations with detailed directions
    // Password reset (OTP via email)
    passwordResetOtp: { type: String },
    passwordResetExpires: { type: Date },
  },
  { timestamps: true }
);

// helpful indexes (avoid duplicates with unique fields)
userSchema.index({ location: "2dsphere" });
userSchema.index({ rating: -1 });
userSchema.index({ completedJobs: -1 });

const User = mongoose.model("User", userSchema);
export default User;
