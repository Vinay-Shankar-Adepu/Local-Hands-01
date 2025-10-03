import React, { useEffect, useState } from "react";
import { FiStar, FiX } from "react-icons/fi";

export default function RatingModal({
  open,
  onClose,
  title = "Rate this job",
  onSubmit,
  submitting = false,
}) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");

  useEffect(() => {
    if (open) {
      setRating(0);
      setHover(0);
      setComment("");
    }
  }, [open]);

  if (!open) return null;

  const handleKeyDown = (e) => {
    if (e.key === "Escape") onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold">{title}</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-brand-gray-100 rounded-lg"
              aria-label="Close"
            >
              <FiX className="w-5 h-5 text-brand-gray-500" />
            </button>
          </div>

          {/* Stars */}
          <div className="flex items-center justify-center mb-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <button
                key={i}
                type="button"
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(0)}
                onClick={() => setRating(i)}
                className={`p-1 ${
                  i <= (hover || rating) ? "text-warning" : "text-brand-gray-300"
                }`}
                aria-label={`Rate ${i}`}
              >
                <FiStar
                  className={`w-7 h-7 ${
                    i <= (hover || rating) ? "fill-current" : ""
                  }`}
                />
              </button>
            ))}
          </div>

          {/* Comment */}
          <textarea
            className="w-full border border-brand-gray-300 rounded-xl p-3 mb-4 focus:ring-2 focus:ring-brand-primary"
            placeholder="Add a short comment (optional)"
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />

          {/* Submit */}
          <button
            disabled={submitting || rating === 0}
            onClick={() => onSubmit({ rating, comment })}
            className="w-full px-4 py-3 bg-brand-primary text-white font-medium rounded-xl hover:bg-blue-600 disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Submit Rating"}
          </button>
        </div>
      </div>
    </div>
  );
}
