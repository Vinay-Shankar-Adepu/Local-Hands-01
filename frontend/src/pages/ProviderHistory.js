import React, { useEffect, useState } from "react";
import API from "../services/api";
import RatingModal from "../components/RatingModal";
import { RatingsAPI } from "../services/api.extras";
import { FiCalendar, FiCheck, FiStar } from "react-icons/fi";

export default function ProviderHistory() {
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
      setError("Failed to load job history. Please try again.");
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const canRate = (b) =>
    b.status === "completed" && !b.providerRating;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-[#0f172a] dark:via-[#1e293b] dark:to-[#0f172a] transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold mb-6 text-brand-gray-900 dark:text-white bg-clip-text dark:bg-gradient-to-r dark:from-blue-400 dark:to-blue-600 dark:text-transparent">Job History</h1>

      {loading ? (
        <div className="text-brand-gray-500 dark:text-gray-400 animate-pulse bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">Loading your jobs...</div>
      ) : error ? (
        <div className="text-error dark:text-red-400 bg-red-50 dark:bg-red-500/10 p-6 rounded-xl border border-red-200 dark:border-red-500/30">{error}</div>
      ) : bookings.length === 0 ? (
        <div className="text-brand-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">No past jobs yet.</div>
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => (
            <div key={b._id} className="bg-white dark:bg-gray-800 rounded-xl border border-brand-gray-200 dark:border-gray-700 p-6 shadow-card dark:shadow-dark-card hover:shadow-cardHover dark:hover:shadow-dark-glow transition-all duration-300">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-brand-gray-900 dark:text-white">#{b.bookingId}</span>
                    {b.status === "completed" && (
                      <span className="inline-flex items-center text-xs bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 px-2 py-0.5 rounded border border-green-200 dark:border-green-500/30">
                        <FiCheck className="w-3 h-3 mr-1" /> Completed
                      </span>
                    )}
                  </div>

                  <div className="font-medium text-brand-gray-900 dark:text-white">{b.service?.name}</div>
                  <div className="text-sm text-brand-gray-500 dark:text-gray-400 flex items-center">
                    <FiCalendar className="w-4 h-4 mr-1" />
                    {b.completedAt
                      ? new Date(b.completedAt).toLocaleString()
                      : b.scheduledAt
                      ? new Date(b.scheduledAt).toLocaleString()
                      : "—"}
                  </div>
                  {b.customer?.name && (
                    <div className="text-sm text-brand-gray-600 dark:text-gray-400 mt-1">
                      <span className="text-brand-gray-900 dark:text-gray-200">Customer: {b.customer.name}</span>
                    </div>
                  )}
                </div>

                <div className="text-right">
                  <div className="font-bold text-brand-primary dark:text-blue-400 text-lg">
                    ₹{b.service?.price ?? 0}
                  </div>
                  {b.customerAvgRating && (
                    <div className="text-xs text-brand-gray-500 dark:text-gray-400 inline-flex items-center gap-1">
                      <FiStar className="w-3 h-3 text-warning dark:text-yellow-400 fill-current" />
                      {b.customerAvgRating.toFixed(1)}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4">
                {canRate(b) ? (
                  <button
                    onClick={() => setRateFor(b)}
                    className="px-4 py-2 bg-brand-primary dark:bg-blue-500 text-white rounded-lg hover:bg-blue-600 dark:hover:bg-blue-600 transition-all duration-300 shadow-sm dark:shadow-glow-blue"
                  >
                    Rate Customer
                  </button>
                ) : b.providerRating ? (
                  <div className="text-sm text-brand-gray-600 dark:text-gray-400 space-y-2">
                    {b.customerRating && (
                      <div className='text-xs text-brand-gray-500 dark:text-gray-400'>Customer rated you: {"⭐".repeat(b.customerRating)} ({b.customerRating}/5)</div>
                    )}
                    {b.reviews && b.reviews.filter(r=>r.direction==='customer_to_provider').map((r,i)=>(
                      r.comment ? <div key={i} className='text-xs text-brand-gray-500 dark:text-gray-400 italic bg-gray-50 dark:bg-gray-700/50 p-2 rounded border border-gray-200 dark:border-gray-600'>"{r.comment}"</div> : null
                    ))}
                  </div>
                ) : b.customerRating ? (
                  <div className='text-xs text-brand-gray-500 dark:text-gray-400 space-y-1'>
                    <div>Customer rated you: {"⭐".repeat(b.customerRating)} ({b.customerRating}/5)</div>
                    {b.reviews && b.reviews.filter(r=>r.direction==='customer_to_provider').map((r,i)=>(
                      r.comment ? <div key={i} className='italic bg-gray-50 dark:bg-gray-700/50 p-2 rounded border border-gray-200 dark:border-gray-600'>"{r.comment}"</div> : null
                    ))}
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
        title="Rate this customer"
        submitting={submitting}
        onSubmit={async ({ rating, comment }) => {
          if (!rateFor) return;
          try {
            setSubmitting(true);
            await RatingsAPI.rateCustomer({ bookingId: rateFor._id, rating, comment });
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
    </div>
  );
}
