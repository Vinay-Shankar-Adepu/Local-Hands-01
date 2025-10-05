import React from "react";
import { FiStar, FiMessageSquare, FiImage, FiEye, FiEyeOff } from "react-icons/fi";
import { motion } from "framer-motion";

/**
 * ReviewCard - Displays a review with proper visibility rules
 * - Reviewers cannot see their own rating/comment (hidden)
 * - Reviewers CAN see their own optional messages
 * - Recipients see everything except who gave the rating
 * - Others browsing profiles see everything
 */
export default function ReviewCard({ 
  review, 
  currentUserId, 
  viewMode = "profile" // "profile" | "history" | "giver"
}) {
  const isGiver = currentUserId === review.customer?._id || currentUserId === review.provider?._id;
  const isCustomerToProvider = review.direction === "customer_to_provider";
  
  // Determine what to show based on viewMode and who is viewing
  const showRatingAndComment = viewMode === "profile" || (viewMode === "history" && !isGiver) || viewMode === "giver";
  const showOptionalMessage = !!review.optionalMessage;
  const showWorkImages = review.workImages && review.workImages.length > 0;

  // For giver view mode, only show what they CAN see (optional message)
  if (viewMode === "giver" && isGiver) {
    if (!showOptionalMessage && !showWorkImages) {
      return (
        <div className="p-4 bg-gray-50 dark:bg-gray-700/30 border border-gray-200 dark:border-gray-600 rounded-xl">
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <FiEyeOff className="w-4 h-4" />
            <span>Your rating and review are hidden from you (but help others)</span>
          </div>
        </div>
      );
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm dark:shadow-dark-card hover:shadow-md dark:hover:shadow-dark-glow transition-all duration-300"
    >
      {/* Header with Rating (if visible) */}
      {showRatingAndComment && (
        <div className="mb-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <FiStar
                    key={i}
                    className={`w-4 h-4 ${
                      i <= review.rating
                        ? "text-yellow-500 fill-current"
                        : "text-gray-300 dark:text-gray-600"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {review.rating}/5
              </span>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {new Date(review.createdAt).toLocaleDateString()}
            </span>
          </div>

          {/* Direction Badge */}
          <div className="flex items-center gap-2 mb-2">
            <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
              isCustomerToProvider
                ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                : "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
            }`}>
              {isCustomerToProvider ? "Customer → Provider" : "Provider → Customer"}
            </span>
          </div>

          {/* Private Comment/Review (if visible) */}
          {review.comment && (
            <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
              <div className="flex items-center gap-2 mb-2">
                <FiEyeOff className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  Private Review
                </span>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {review.comment}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Optional Message (visible to both parties) */}
      {showOptionalMessage && (
        <div className="mb-3 bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-700">
          <div className="flex items-center gap-2 mb-2">
            <FiMessageSquare className="w-4 h-4 text-green-600 dark:text-green-400" />
            <span className="text-xs font-medium text-green-700 dark:text-green-400">
              Message {viewMode === "giver" ? "you sent" : "from them"}
            </span>
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300 italic">
            "{review.optionalMessage}"
          </p>
        </div>
      )}

      {/* Work Images (if available) */}
      {showWorkImages && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <FiImage className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
              Work Images ({review.workImages.length})
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {review.workImages.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt={`Work ${idx + 1}`}
                className="w-full h-24 object-cover rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer hover:scale-105 transition-transform"
                onClick={() => window.open(img, '_blank')}
              />
            ))}
          </div>
        </div>
      )}

      {/* Footer Info */}
      {viewMode === "profile" && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>
              {isCustomerToProvider 
                ? `Customer: ${review.customer?.name || "Anonymous"}`
                : `Provider: ${review.provider?.name || "Anonymous"}`
              }
            </span>
            <span className="flex items-center gap-1">
              <FiEye className="w-3 h-3" />
              Public
            </span>
          </div>
        </div>
      )}
    </motion.div>
  );
}
