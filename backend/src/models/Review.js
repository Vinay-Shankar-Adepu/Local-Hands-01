import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    booking: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    provider: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String, maxlength: 1000 },
    // direction: 'customer_to_provider' or 'provider_to_customer'
    direction: { type: String, enum: ["customer_to_provider", "provider_to_customer"], required: true }
  },
  { timestamps: true }
);

reviewSchema.index({ provider: 1, createdAt: -1 });
reviewSchema.index({ booking: 1, direction: 1 }, { unique: true });
reviewSchema.index({ booking: 1 });

const Review = mongoose.model("Review", reviewSchema);
export default Review;
