import React, { useEffect, useState } from "react";
import API from "../services/api";
import { FiUser, FiCalendar, FiCheck, FiX, FiStar } from "react-icons/fi";
import RatingModal from "../components/RatingModal";
import { RatingsAPI } from "../services/api.extras";

export default function ProviderHistory() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rateFor, setRateFor] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await API.get("/bookings/mine", { params: { history: true } });
        setBookings(data.bookings || []);
      } catch {
        console.error("Failed to load history");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const canRate = (b) => b.status === "completed" && !b.providerRating;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-[#0f172a] dark:via-[#1e293b] dark:to-[#0f172a] transition-all duration-300">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold mb-6 text-brand-gray-900 dark:text-white">
          My Service History
        </h1>

        {loading ? (
          <div className="p-6 text-gray-500 dark:text-gray-400 animate-pulse">
            Loading your completed jobs...
          </div>
        ) : bookings.length === 0 ? (
          <div className="p-6 text-gray-500 dark:text-gray-400">
            No past jobs yet.
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((b) => (
              <div
                key={b._id}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow hover:shadow-lg transition-all duration-300"
              >
                <div className="flex justify-between items-start mb-2">
                  <h2 className="font-semibold text-lg text-gray-900 dark:text-white">
                    {b.service?.name || "Service"}
                  </h2>
                  <div className="flex items-center gap-2 text-sm">
                    {b.status === "completed" && (
                      <span className="text-green-600 dark:text-green-400 flex items-center">
                        <FiCheck className="mr-1" /> Completed
                      </span>
                    )}
                    {b.status === "rejected" && (
                      <span className="text-red-500 flex items-center">
                        <FiX className="mr-1" /> Rejected
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                  <FiCalendar className="w-4 h-4" />
                  {b.completedAt
                    ? new Date(b.completedAt).toLocaleString()
                    : "—"}
                </div>

                <div className="mt-3 flex items-center gap-2 text-sm">
                  <FiUser className="text-gray-400" />
                  <span>Customer: {b.customer?.name || "Unknown"}</span>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="text-blue-500 font-semibold">
                    ₹{b.service?.price || 0}
                  </div>

                  {canRate(b) ? (
                    <button
                      onClick={() => setRateFor(b)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm"
                    >
                      Rate Customer
                    </button>
                  ) : b.providerRating ? (
                    <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <FiStar className="text-yellow-400" />{" "}
                      {b.providerRating}/5
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}

        <RatingModal
          open={!!rateFor}
          title="Rate your customer"
          onClose={() => setRateFor(null)}
          submitting={submitting}
          onSubmit={async ({ rating, comment }) => {
            if (!rateFor) return;
            try {
              setSubmitting(true);
              await RatingsAPI.rateCustomer({
                bookingId: rateFor._id,
                rating,
                comment,
              });
              setRateFor(null);
              window.location.reload();
            } catch {
              alert("Failed to rate customer.");
            } finally {
              setSubmitting(false);
            }
          }}
        />
      </div>
    </div>
  );
}
