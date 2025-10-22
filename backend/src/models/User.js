import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    // --------------------------
    // 👤 Basic Identity
    // --------------------------
    name: { type: String, required: true },
    email: { type: String, unique: true, sparse: true, lowercase: true },
    password: { type: String }, // optional if Google auth only
    phone: { type: String, unique: true, sparse: true },
    googleId: { type: String },
    role: {
      type: String,
      enum: ["customer", "provider", "admin", null],
      default: null,
    },
    verified: { type: Boolean, default: false },

    // --------------------------
    // 📍 Provider Availability & Location
    // --------------------------
    isAvailable: { type: Boolean, default: false },
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], default: [0, 0] }, // [lng, lat]
    },
    lastServiceLocation: {
      type: { type: String, enum: ["Point"] },
      coordinates: { type: [Number] },
    },
    lastServiceCompletedAt: { type: Date },
    isLiveTracking: { type: Boolean, default: false },

    // --------------------------
    // 🧾 Provider Verification & KYC
    // --------------------------
    documents: [{ type: String }],
    selfie: { type: String },
    otpVerified: { type: Boolean, default: false },
    onboardingStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    licenseImage: { type: String },
    licenseType: {
      type: String,
      enum: ["aadhar", "pan", "driving_license", "other"],
    },
    licenseNumber: { type: String },
    verificationSubmittedAt: { type: Date },
    verificationReviewedAt: { type: Date },
    verificationReviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    rejectionReason: { type: String },

    // --------------------------
    // ⭐ Ratings & Performance
    // --------------------------
    rating: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    completedJobs: { type: Number, default: 0 },

    // --------------------------
    // 💰 Payment & Financial Tracking
    // --------------------------
    totalEarnings: { type: Number, default: 0 }, // for provider
    walletBalance: { type: Number, default: 0 }, // pending or available funds
    totalSpent: { type: Number, default: 0 }, // for customer
    servicesCompleted: { type: Number, default: 0 }, // for customer stats
    lastPaymentReceivedAt: { type: Date },
    lastPaymentAmount: { type: Number, default: 0 },
    paymentHistory: [
      {
        bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking" },
        amount: { type: Number },
        method: { type: String, enum: ["razorpay", "cash", "refund"] },
        timestamp: { type: Date, default: Date.now },
      },
    ],

    // --------------------------
    // 🏠 Customer Info
    // --------------------------
    address: { type: String },
    preciseAddress: { type: String },

    // --------------------------
    // 🔐 Security & OTP Workflows
    // --------------------------
    passwordResetOtp: { type: String },
    passwordResetExpires: { type: Date },
    phoneOtp: { type: String },
    phoneOtpExpires: { type: Date },
  },
  { timestamps: true }
);

//
// 🧭 Indexes for faster queries
//
userSchema.index({ location: "2dsphere" });
userSchema.index({ rating: -1 });
userSchema.index({ completedJobs: -1 });
userSchema.index({ totalEarnings: -1 });

//
// ⚙️ Utility Methods
//
userSchema.methods.addEarnings = function (amount) {
  this.totalEarnings += amount;
  this.walletBalance += amount;
  this.lastPaymentReceivedAt = new Date();
  this.lastPaymentAmount = amount;
  return this.save();
};

userSchema.methods.addServiceCompleted = function () {
  this.servicesCompleted += 1;
  return this.save();
};

const User = mongoose.model("User", userSchema);
export default User;
