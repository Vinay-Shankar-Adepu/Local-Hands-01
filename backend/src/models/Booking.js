import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    // Unique booking ID, e.g. O1001
    bookingId: { type: String, required: true, unique: true },

    // Participants
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }, // filled after provider accepts

    // Services
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },
    serviceTemplate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ServiceTemplate",
    },

    // Scheduling
    scheduledAt: { type: Date },

    // Rating & review workflow
    customerRating: { type: Number, min: 1, max: 5 },
    providerRating: { type: Number, min: 1, max: 5 },
    customerReviewed: { type: Boolean, default: false },
    providerReviewed: { type: Boolean, default: false },
    reviewStatus: {
      type: String,
      enum: [
        "none",
        "customer_pending",
        "provider_pending",
        "both_pending",
        "fully_closed",
      ],
      default: "none",
    },

    // Job state
    status: {
      type: String,
      enum: [
        "requested",
        "accepted",
        "in_progress",
        "completed_by_provider",
        "paid",
        "completed",
        "rejected",
        "cancelled",
      ],
      default: "requested",
    },

    // Generalized global state for admin dashboards
    overallStatus: {
      type: String,
      enum: ["pending", "in-progress", "completed", "cancelled", "expired"],
      default: "pending",
    },

    // -------------------------
    // 🧾 Billing & Payment Logic
    // -------------------------

    basePrice: { type: Number, default: 0 },
    extraCharges: { type: Number, default: 0 },
    billAmount: { type: Number, default: 0 },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["razorpay", "cash", "none"],
      default: "none",
    },
    paymentId: { type: String }, // Razorpay payment_id or "CASH-xxxx"
    paymentVerifiedAt: { type: Date },
    markedCompleteAt: { type: Date }, // when provider marks complete

    // -------------------------
    // 🌍 Location & Tracking
    // -------------------------

    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], default: [0, 0] }, // [lng, lat]
    },

    providerLocation: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], default: [0, 0] },
    },
    providerLastUpdate: { type: Date },
    distanceFromCustomer: { type: Number, default: 0 }, // dynamically updated

    // -------------------------
    // 🕒 Workflow timestamps
    // -------------------------
    acceptedAt: { type: Date },
    completedAt: { type: Date },
    cancelledAt: { type: Date },
    rejectionReason: { type: String },

    // -------------------------
    // ⚙️ Multi-provider pipeline
    // -------------------------
    providerResponses: [
      {
        providerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        status: {
          type: String,
          enum: ["accepted", "rejected", "pending"],
          default: "pending",
        },
        respondedAt: { type: Date },
      },
    ],

    pendingProviders: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    offers: [
      {
        provider: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        status: {
          type: String,
          enum: ["pending", "accepted", "declined", "expired"],
          default: "pending",
        },
        offeredAt: { type: Date, default: Date.now },
        respondedAt: { type: Date },
      },
    ],

    providerResponseTimeout: { type: Date },
    autoAssignMessage: { type: String },
    pendingExpiresAt: { type: Date },
  },
  { timestamps: true }
);

// ✅ Indexes for geospatial queries
bookingSchema.index({ location: "2dsphere" });
bookingSchema.index({ providerLocation: "2dsphere" });

// ✅ Utility: Update provider position and distance
bookingSchema.methods.updateProviderPosition = function (lng, lat, customerCoords) {
  this.providerLocation = { type: "Point", coordinates: [lng, lat] };
  this.providerLastUpdate = new Date();

  if (customerCoords && Array.isArray(customerCoords) && customerCoords.length === 2) {
    const [lng2, lat2] = customerCoords;
    const R = 6371;
    const dLat = ((lat2 - lat) * Math.PI) / 180;
    const dLng = ((lng2 - lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    this.distanceFromCustomer = Number((R * c).toFixed(2));
  }
  return this;
};

const Booking = mongoose.model("Booking", bookingSchema);
export default Booking;
