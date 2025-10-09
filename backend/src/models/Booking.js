import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    bookingId: { type: String, required: true, unique: true }, // O1001...
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    provider: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // filled after accept
    service: { type: mongoose.Schema.Types.ObjectId, ref: "Service", required: true },
    // For multi-provider flow we also capture template (neutral before provider assignment)
    serviceTemplate: { type: mongoose.Schema.Types.ObjectId, ref: 'ServiceTemplate' },
  scheduledAt: { type: Date },
    // Ratings given after completion
    customerRating: { type: Number, min: 1, max: 5 }, // rating customer gave provider
    providerRating: { type: Number, min: 1, max: 5 }, // rating provider gave customer
    
    // Review tracking for automatic rating flow
    customerReviewed: { type: Boolean, default: false },
    providerReviewed: { type: Boolean, default: false },
    reviewStatus: { 
      type: String, 
      enum: ["none", "customer_pending", "provider_pending", "both_pending", "fully_closed"], 
      default: "none" 
    },

    status: {
      type: String,
      enum: ["requested", "accepted", "in_progress", "rejected", "completed", "cancelled"],
      default: "requested"
    },
    // New generalized overall status for multi-provider visibility logic
    overallStatus: {
      type: String,
      enum: ['pending','in-progress','completed','cancelled','expired'],
      default: 'pending'
    },

    // where the service is requested
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], default: [0, 0] } // [lng, lat]
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending"
    },
    acceptedAt: { type: Date },
    completedAt: { type: Date },
    cancelledAt: { type: Date },
    rejectionReason: { type: String }
    ,
    // Track each provider's response (accept / reject / pending)
    providerResponses: [{
      providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      status: { type: String, enum: ['accepted','rejected','pending'], default: 'pending' },
      respondedAt: { type: Date }
    }],
    // Multi-provider assignment pipeline
    pendingProviders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // ordered queue not yet offered
    offers: [{
      provider: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      status: { type: String, enum: ['pending','accepted','declined','expired'], default: 'pending' },
      offeredAt: { type: Date, default: Date.now },
      respondedAt: { type: Date }
    }],
    providerResponseTimeout: { type: Date }, // when current offer expires
    autoAssignMessage: { type: String }
    ,
    // New: automatic expiry of pending booking if no provider accepts within window
    pendingExpiresAt: { type: Date }
  },
  { timestamps: true }
);

bookingSchema.index({ location: "2dsphere" });

const Booking = mongoose.model("Booking", bookingSchema);
export default Booking;
