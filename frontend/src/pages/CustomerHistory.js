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
  const [providerProfile, setProviderProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

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
                    <div className="text-sm text-brand-gray-600 mt-1 flex items-center gap-2">
                      <span>Provider: {b.provider.name}</span>
                      <button
                        onClick={async () => { setLoadingProfile(true); try { const { data } = await API.get(`/providers/${b.provider._id}/profile`); setProviderProfile(data); } catch { alert('Failed to load provider profile'); } finally { setLoadingProfile(false); } }}
                        className='text-brand-primary text-xs underline'>View Profile</button>
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
                  <div className="text-sm text-brand-gray-600 space-y-2">
                    {b.providerRating && (
                      <div className='text-xs text-brand-gray-500'>Provider rated you: {"⭐".repeat(b.providerRating)} ({b.providerRating}/5)</div>
                    )}
                    {b.reviews && b.reviews.filter(r=>r.direction==='provider_to_customer').map((r,i)=>(
                      r.comment ? <div key={i} className='text-xs text-brand-gray-500 italic'>"{r.comment}"</div> : null
                    ))}
                  </div>
                ) : b.providerRating ? (
                  <div className='text-xs text-brand-gray-500 space-y-1'>
                    <div>Provider rated you: {"⭐".repeat(b.providerRating)} ({b.providerRating}/5)</div>
                    {b.reviews && b.reviews.filter(r=>r.direction==='provider_to_customer').map((r,i)=>(
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
      {providerProfile && (
        <div className='fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4' onClick={()=>setProviderProfile(null)}>
          <div className='bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl' onClick={e=>e.stopPropagation()}>
            <div className='flex items-center justify-between mb-4'>
              <h3 className='text-xl font-semibold'>{providerProfile.provider.name}</h3>
              <button onClick={()=>setProviderProfile(null)} className='text-sm text-brand-gray-500 hover:text-brand-gray-800'>Close</button>
            </div>
            <div className='flex items-center gap-4 mb-4'>
              <div className='px-3 py-2 bg-yellow-500/10 rounded-lg text-sm'>⭐ {providerProfile.provider.rating?.toFixed?.(1) || 0} ({providerProfile.provider.ratingCount || 0})</div>
              <div className='text-sm text-brand-gray-600'>Completed jobs: {providerProfile.stats.completedJobs}</div>
            </div>
            <h4 className='font-medium mb-2'>Recent Reviews</h4>
            <div className='space-y-3 max-h-60 overflow-auto pr-2'>
              {providerProfile.reviews.length === 0 && <p className='text-xs text-brand-gray-500'>No reviews yet.</p>}
              {providerProfile.reviews.map((r,i)=>(
                <div key={i} className='p-3 border rounded-lg text-sm'>
                  <div className='font-medium mb-1'>{'⭐'.repeat(r.rating)} <span className='text-xs text-brand-gray-500'>{new Date(r.createdAt).toLocaleDateString()}</span></div>
                  {r.comment && <p className='text-brand-gray-600 text-xs'>{r.comment}</p>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
