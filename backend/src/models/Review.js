import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    booking: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    provider: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    
    // Hidden from the person who gave it (used for platform quality & other party's profile)
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String, maxlength: 1000 }, // Private review/feedback
    
    // Optional message - visible to the other party (public, polite communication)
    optionalMessage: { type: String, maxlength: 500 },
    
    // Customer can attach images of work done (only for customer_to_provider)
    workImages: [{ type: String }], // Array of image URLs/paths
    
    // direction: 'customer_to_provider' or 'provider_to_customer'
    direction: { type: String, enum: ["customer_to_provider", "provider_to_customer"], required: true },
    
    // Visibility flags
    isHiddenFromGiver: { type: Boolean, default: true }, // Rating/comment hidden from giver
    isPublic: { type: Boolean, default: true } // Visible to others browsing profiles
  },
  { timestamps: true }
);

reviewSchema.index({ provider: 1, createdAt: -1 });
reviewSchema.index({ booking: 1, direction: 1 }, { unique: true });
reviewSchema.index({ booking: 1 });

const Review = mongoose.model("Review", reviewSchema);
export default Review;
