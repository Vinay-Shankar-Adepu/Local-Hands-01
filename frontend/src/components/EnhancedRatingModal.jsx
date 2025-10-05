import React, { useEffect, useState } from "react";
import { FiStar, FiX, FiImage, FiAlertCircle, FiMessageSquare, FiEye, FiEyeOff } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

export default function EnhancedRatingModal({
  open,
  onClose,
  title = "Rate this service",
  onSubmit,
  submitting = false,
  userRole = "customer", // "customer" or "provider"
  otherPartyName = "the other party",
  otherPartyRating = null,
  otherPartyReviews = [],
  showImageUpload = false, // Only for customers
}) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState(""); // Private review (hidden from giver)
  const [optionalMessage, setOptionalMessage] = useState(""); // Public message (visible to other party)
  const [workImages, setWorkImages] = useState([]); // Image URLs (customer only)
  const [imagePreview, setImagePreview] = useState(null);
  const [showGuidelines, setShowGuidelines] = useState(false);

  useEffect(() => {
    if (open) {
      setRating(0);
      setHover(0);
      setComment("");
      setOptionalMessage("");
      setWorkImages([]);
      setImagePreview(null);
    }
  }, [open]);

  if (!open) return null;

  const handleKeyDown = (e) => {
    if (e.key === "Escape") onClose();
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // In production, upload to cloud storage and get URL
      // For now, create a local preview
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageUrl = reader.result;
        setWorkImages([...workImages, imageUrl]);
        setImagePreview(imageUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (index) => {
    setWorkImages(workImages.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    onSubmit({ 
      rating, 
      comment, 
      optionalMessage,
      workImages: showImageUpload ? workImages : undefined
    });
  };

  const isCustomer = userRole === "customer";

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4"
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.3 }}
        className="bg-white dark:bg-gray-800 w-full max-w-2xl rounded-2xl shadow-2xl dark:shadow-dark-glow border border-gray-200 dark:border-gray-700 max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              aria-label="Close"
            >
              <FiX className="w-6 h-6 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Informational Banner */}
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl">
            <div className="flex items-start gap-3">
              <FiAlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800 dark:text-blue-200">
                <p className="font-semibold mb-1">Here's {otherPartyName}'s ratings and reviews</p>
                <p className="mb-2">
                  {isCustomer 
                    ? "Would you like to leave your rating, review, optional message, or attach an image?"
                    : "Would you like to leave your rating, review, or optional message?"}
                </p>
                <div className="flex items-center gap-2 text-xs">
                  <FiEyeOff className="w-4 h-4" />
                  <span>Your rating/review is hidden from you but helps others</span>
                </div>
                <div className="flex items-center gap-2 text-xs mt-1">
                  <FiEye className="w-4 h-4" />
                  <span>Optional messages are visible to the other party</span>
                </div>
              </div>
            </div>
          </div>

          {/* Other Party's Info */}
          {otherPartyRating !== null && (
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                {otherPartyName}'s Profile
              </h4>
              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <FiStar
                      key={i}
                      className={`w-4 h-4 ${
                        i <= Math.round(otherPartyRating)
                          ? "text-yellow-500 fill-current"
                          : "text-gray-300 dark:text-gray-600"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {otherPartyRating.toFixed(1)} ({otherPartyReviews.length} reviews)
                </span>
              </div>
              
              {otherPartyReviews.length > 0 && (
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Recent reviews:</p>
                  {otherPartyReviews.slice(0, 3).map((review, idx) => (
                    <div key={idx} className="text-xs text-gray-600 dark:text-gray-400 pl-2 border-l-2 border-gray-300 dark:border-gray-600">
                      <div className="flex items-center gap-1 mb-1">
                        {[...Array(review.rating)].map((_, i) => (
                          <FiStar key={i} className="w-3 h-3 text-yellow-500 fill-current" />
                        ))}
                      </div>
                      {review.optionalMessage && (
                        <p className="italic">"{review.optionalMessage}"</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Guidelines Toggle */}
          <button
            onClick={() => setShowGuidelines(!showGuidelines)}
            className="mb-4 text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-2"
          >
            <FiMessageSquare className="w-4 h-4" />
            {showGuidelines ? "Hide" : "Show"} feedback guidelines
          </button>

          <AnimatePresence>
            {showGuidelines && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg text-sm text-green-800 dark:text-green-200"
              >
                <p className="font-semibold mb-2">📝 Feedback Guidelines:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Be polite, professional, and constructive</li>
                  <li>Focus on specific aspects of the service</li>
                  <li>Avoid personal attacks or offensive language</li>
                  <li>Your rating helps maintain quality on our platform</li>
                  <li>Optional messages should be respectful and encouraging</li>
                </ul>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Star Rating */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Your Rating (1-5 stars) <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center justify-center gap-2 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              {[1, 2, 3, 4, 5].map((i) => (
                <button
                  key={i}
                  type="button"
                  onMouseEnter={() => setHover(i)}
                  onMouseLeave={() => setHover(0)}
                  onClick={() => setRating(i)}
                  className="p-2 hover:scale-110 transition-transform"
                  aria-label={`Rate ${i}`}
                >
                  <FiStar
                    className={`w-10 h-10 transition-colors ${
                      i <= (hover || rating)
                        ? "text-yellow-500 fill-current"
                        : "text-gray-300 dark:text-gray-600"
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-2">
                {rating === 5 && "⭐ Excellent!"}
                {rating === 4 && "👍 Very Good"}
                {rating === 3 && "👌 Good"}
                {rating === 2 && "😐 Fair"}
                {rating === 1 && "😞 Needs Improvement"}
              </p>
            )}
          </div>

          {/* Private Review/Comment (Hidden from giver) */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Your Review (Optional)
              </label>
              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                <FiEyeOff className="w-3 h-3" />
                <span>Hidden from you</span>
              </div>
            </div>
            <textarea
              className="w-full border border-gray-300 dark:border-gray-600 rounded-xl p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Share constructive feedback to help improve the platform (visible to others, hidden from you)..."
              rows={3}
              maxLength={1000}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {comment.length}/1000 characters
            </p>
          </div>

          {/* Optional Message (Visible to other party) */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Optional Message to {isCustomer ? "Provider" : "Customer"}
              </label>
              <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                <FiEye className="w-3 h-3" />
                <span>Visible to them</span>
              </div>
            </div>
            <textarea
              className="w-full border border-gray-300 dark:border-gray-600 rounded-xl p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
              placeholder="Leave a polite message they can see (thank you note, tip, suggestion)..."
              rows={2}
              maxLength={500}
              value={optionalMessage}
              onChange={(e) => setOptionalMessage(e.target.value)}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {optionalMessage.length}/500 characters
            </p>
          </div>

          {/* Image Upload (Customer Only) */}
          {showImageUpload && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Attach Images of Work Done (Optional)
              </label>
              <div className="space-y-3">
                <label className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl hover:border-blue-500 dark:hover:border-blue-400 cursor-pointer transition-colors bg-gray-50 dark:bg-gray-700/50">
                  <FiImage className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Click to upload image
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>

                {workImages.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {workImages.map((img, idx) => (
                      <div key={idx} className="relative group">
                        <img
                          src={img}
                          alt={`Work ${idx + 1}`}
                          className="w-full h-24 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                        />
                        <button
                          onClick={() => removeImage(idx)}
                          className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <FiX className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            disabled={submitting || rating === 0}
            onClick={handleSubmit}
            className="w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl dark:shadow-blue-500/20"
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Submitting...
              </span>
            ) : (
              "Submit Rating & Review"
            )}
          </button>

          <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-3">
            By submitting, you agree to maintain professional and constructive feedback
          </p>
        </div>
      </motion.div>
    </div>
  );
}
