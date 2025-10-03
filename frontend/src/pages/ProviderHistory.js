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
    <div className="max-w-7xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold mb-6">Job History</h1>

      {loading ? (
        <div className="text-brand-gray-500 animate-pulse">Loading your jobs...</div>
      ) : error ? (
        <div className="text-error">{error}</div>
      ) : bookings.length === 0 ? (
        <div className="text-brand-gray-600">No past jobs yet.</div>
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
                  {b.customer?.name && (
                    <div className="text-sm text-brand-gray-600 mt-1">
                      Customer: {b.customer.name}
                    </div>
                  )}
                </div>

                <div className="text-right">
                  <div className="font-bold text-brand-primary text-lg">
                    ₹{b.service?.price ?? 0}
                  </div>
                  {b.customerAvgRating && (
                    <div className="text-xs text-brand-gray-500 inline-flex items-center gap-1">
                      <FiStar className="w-3 h-3 text-warning fill-current" />
                      {b.customerAvgRating.toFixed(1)}
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
                    Rate Customer
                  </button>
                ) : b.providerRating ? (
                  <div className="text-sm text-brand-gray-600 space-y-2">
                    {b.customerRating && (
                      <div className='text-xs text-brand-gray-500'>Customer rated you: {"⭐".repeat(b.customerRating)} ({b.customerRating}/5)</div>
                    )}
                    {b.reviews && b.reviews.filter(r=>r.direction==='customer_to_provider').map((r,i)=>(
                      r.comment ? <div key={i} className='text-xs text-brand-gray-500 italic'>"{r.comment}"</div> : null
                    ))}
                  </div>
                ) : b.customerRating ? (
                  <div className='text-xs text-brand-gray-500 space-y-1'>
                    <div>Customer rated you: {"⭐".repeat(b.customerRating)} ({b.customerRating}/5)</div>
                    {b.reviews && b.reviews.filter(r=>r.direction==='customer_to_provider').map((r,i)=>(
                      r.comment ? <div key={i} className='italic'>"{r.comment}"</div> : null
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
  );
}
