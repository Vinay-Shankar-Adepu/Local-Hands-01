import React, { useEffect, useState } from "react";
import API from "../services/api";
import { FiCalendar, FiCheck, FiX, FiStar } from "react-icons/fi";
import RatingModal from "../components/RatingModal";
import { RatingsAPI } from "../services/api.extras";

export default function CustomerHistory() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rateFor, setRateFor] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await API.get("/bookings/mine", { params: { history: true } });
      setBookings(data.bookings ?? []);
    } catch (e) {
      setError("Failed to load history. Please try again.");
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const canRate = (b) =>
    b.status === "completed" && !b.customerRating;

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold mb-6">My History</h1>

      {loading ? (
        <div className="text-brand-gray-500 animate-pulse">Loading your bookings...</div>
      ) : error ? (
        <div className="text-error">{error}</div>
      ) : bookings.length === 0 ? (
        <div className="text-brand-gray-600">No past bookings yet.</div>
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => (
            <div key={b._id} className="bg-white rounded-xl border p-6 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold">#{b.bookingId}</span>
                    {b.status === "completed" && (
                      <span className="inline-flex items-center text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                        <FiCheck className="w-3 h-3 mr-1" /> Completed
                      </span>
                    )}
                    {b.status === "rejected" && (
                      <span className="inline-flex items-center text-xs bg-error/10 text-error px-2 py-0.5 rounded">
                        <FiX className="w-3 h-3 mr-1" /> Rejected
                      </span>
                    )}
                  </div>

                  <div className="font-medium">{b.service?.name}</div>
                  <div className="text-sm text-brand-gray-500 flex items-center">
                    <FiCalendar className="w-4 h-4 mr-1" />
                    {b.completedAt
                      ? new Date(b.completedAt).toLocaleString()
                      : b.scheduledAt
                      ? new Date(b.scheduledAt).toLocaleString()
                      : "—"}
                  </div>
                  {b.provider?.name && (
                    <div className="text-sm text-brand-gray-600 mt-1">
                      Provider: {b.provider.name}
                    </div>
                  )}
                </div>

                <div className="text-right">
                  <div className="font-bold text-brand-primary text-lg">
                    ₹{b.service?.price ?? 0}
                  </div>
                  {b.providerAvgRating && (
                    <div className="text-xs text-brand-gray-500 inline-flex items-center gap-1">
                      <FiStar className="w-3 h-3 text-warning fill-current" />
                      {b.providerAvgRating.toFixed(1)}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4">
                {canRate(b) ? (
                  <button
                    onClick={() => setRateFor(b)}
                    className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-blue-600"
                  >
                    Rate Provider
                  </button>
                ) : b.customerRating ? (
                  <div className="text-sm text-brand-gray-600">
                    Your rating: {"⭐".repeat(b.customerRating)} ({b.customerRating}/5)
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}

      <RatingModal
        open={!!rateFor}
        onClose={() => setRateFor(null)}
        title="Rate your provider"
        submitting={submitting}
        onSubmit={async ({ rating, comment }) => {
          if (!rateFor) return;
          try {
            setSubmitting(true);
            await RatingsAPI.rateProvider({ bookingId: rateFor._id, rating, comment });
            setRateFor(null);
            load();
          } catch {
            alert("Failed to submit rating. Please try again.");
          } finally {
            setSubmitting(false);
          }
        }}
      />
    </div>
  );
}
