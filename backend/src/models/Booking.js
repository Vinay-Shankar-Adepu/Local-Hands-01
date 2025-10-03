import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    bookingId: { type: String, required: true, unique: true }, // O1001...
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    provider: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // filled after accept
    service: { type: mongoose.Schema.Types.ObjectId, ref: "Service", required: true },
  scheduledAt: { type: Date },
    // Ratings given after completion
    customerRating: { type: Number, min: 1, max: 5 }, // rating customer gave provider
    providerRating: { type: Number, min: 1, max: 5 }, // rating provider gave customer

    status: {
      type: String,
      enum: ["requested", "accepted", "rejected", "completed", "cancelled"],
      default: "requested"
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
  },
  { timestamps: true }
);

bookingSchema.index({ location: "2dsphere" });

const Booking = mongoose.model("Booking", bookingSchema);
export default Booking;
