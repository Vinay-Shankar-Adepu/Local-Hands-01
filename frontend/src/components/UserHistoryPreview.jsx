import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiStar, FiX, FiUser, FiCheckCircle } from 'react-icons/fi';
import API from '../services/api';

export default function UserHistoryPreview({ userId, userRole, isOpen, onClose }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    if (isOpen && userId) {
      loadHistory();
    }
  }, [isOpen, userId]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const { data: response } = await API.get(`/users/public-history/${userId}`);
      setData(response);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
              {data?.user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {data?.user?.name || 'User Profile'}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                {data?.user?.role || userRole}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <FiX className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-140px)]">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl">
                  <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-1">
                    <FiStar className="w-5 h-5" />
                    <span className="text-sm font-medium">Average Rating</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {data?.user?.rating?.toFixed(1) || 'N/A'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {data?.user?.ratingCount || 0} reviews
                  </p>
                </div>

                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl">
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400 mb-1">
                    <FiCheckCircle className="w-5 h-5" />
                    <span className="text-sm font-medium">Completed Jobs</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {data?.stats?.completed || 0}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Total bookings
                  </p>
                </div>
              </div>

              {/* Recent Reviews */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Recent Reviews
                </h4>
                {!data?.reviews || data.reviews.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <FiUser className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No reviews yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {data.reviews.map((review, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <FiStar
                                key={i}
                                className={`w-4 h-4 ${
                                  i < review.rating
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300 dark:text-gray-600'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        {review.comment && (
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            "{review.comment}"
                          </p>
                        )}
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 capitalize">
                          {review.direction === 'customer_to_provider' 
                            ? 'From Customer' 
                            : 'From Provider'}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Trust Badge */}
              {data?.user?.rating >= 4.5 && data?.stats?.completed >= 10 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 p-4 rounded-xl border-2 border-yellow-400 dark:border-yellow-600"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-4xl">🏆</div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        Trusted {data.user.role === 'provider' ? 'Provider' : 'Customer'}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Excellent track record with high ratings
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <button
            onClick={onClose}
            className="w-full px-6 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all font-medium"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
}
