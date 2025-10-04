import React, { useEffect, useState } from "react";
import API from "../services/api";
import RatingModal from "../components/RatingModal";
import { RatingsAPI } from "../services/api.extras";
import {
  FiBriefcase,
  FiUser,
  FiCalendar,
  FiCheck,
  FiX,
  FiPhone,
  FiMapPin,
  FiStar,
  FiClock, // ✅ used as "history" icon
} from "react-icons/fi";
import { Link } from "react-router-dom";

export default function ProviderHome() {
  const [services, setServices] = useState([]);
  const [catalog, setCatalog] = useState([]);
  const [selecting, setSelecting] = useState(false);
  const [selectedTemplates, setSelectedTemplates] = useState(new Set());
  const [submittingSelection, setSubmittingSelection] = useState(false);
  const [loading, setLoading] = useState(false); // for deletion
  const [error, setError] = useState("");
  const [bookings, setBookings] = useState([]);
  const [rateTarget, setRateTarget] = useState(null);
  const [submittingRating, setSubmittingRating] = useState(false);
  const [customerProfile, setCustomerProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  const loadServices = () => {
    API.get("/services/mine")
      .then((r) => setServices(r.data.services))
      .catch((e) => {
        if (e.response?.status === 403) {
          setError("Your account is not a provider or not approved yet.");
        } else {
          setError(e?.response?.data?.message || "Failed to load services");
        }
      });
  };

  const loadBookings = () => {
    API.get("/bookings/mine")
      .then((r) => setBookings(r.data.bookings || []))
      .catch(() => {});
  };

  useEffect(() => {
    loadServices();
  }, []);

  useEffect(()=>{
    if (services.length === 0) {
      // auto-open selection after slight delay to allow layout mount
      const t = setTimeout(()=>openSelection(), 300);
      return ()=>clearTimeout(t);
    }
  }, [services]);

  useEffect(() => {
    loadBookings();
    const iv = setInterval(loadBookings, 5000); // auto-refresh bookings
    return () => clearInterval(iv);
  }, []);

  const openSelection = async () => {
    try {
      setSelecting(true);
      const { data } = await API.get('/catalog');
      setCatalog(data.catalog || []);
    } catch(e){
      alert('Failed to load catalog');
      setSelecting(false);
    }
  };

  const toggleTemplate = (id) => {
    setSelectedTemplates(prev => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  };

  const submitSelection = async () => {
    if (selectedTemplates.size === 0) { alert('Select at least one service'); return; }
    try {
      setSubmittingSelection(true);
      await API.post('/providers/select-services', { templateIds: Array.from(selectedTemplates) });
      setSelecting(false);
      setSelectedTemplates(new Set());
      loadServices();
    } catch(e){
      alert(e?.response?.data?.message || 'Failed to add services');
    } finally { setSubmittingSelection(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-[#0f172a] dark:via-[#1e293b] dark:to-[#0f172a] transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-brand-gray-900 dark:text-white mb-2 bg-clip-text dark:bg-gradient-to-r dark:from-blue-400 dark:to-blue-600 dark:text-transparent">
              Provider Dashboard
            </h1>
            <p className="text-brand-gray-600 dark:text-gray-400">
              Manage your services and bookings
            </p>
          </div>
          <Link
            to="/provider/history"
            className="flex items-center gap-2 px-4 py-2 bg-brand-primary dark:bg-blue-500 text-white rounded-xl shadow-md dark:shadow-glow-blue hover:bg-blue-600 dark:hover:bg-blue-600 transition-all duration-300 hover:scale-105"
          >
            <FiClock className="w-4 h-4" />
            View History
          </Link>
        </div>

        {/* Services Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-brand-gray-900 dark:text-white mb-6">
            My Services
          </h2>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-card dark:shadow-dark-card border border-transparent dark:border-gray-700 mb-6 flex items-center justify-between gap-4 flex-wrap transition-all duration-300">
            <p className="text-sm text-brand-gray-600 dark:text-gray-400">Services are now selected from the curated catalog.</p>
            <button onClick={openSelection} className="px-4 py-2 bg-brand-primary dark:bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 dark:hover:bg-blue-600 transition-all duration-300 shadow-sm dark:shadow-glow-blue">Add From Catalog</button>
          </div>

          {services.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-brand-gray-200 dark:border-gray-700 shadow-card dark:shadow-dark-card transition-all duration-300">
              <FiBriefcase className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <p className="text-brand-gray-600 dark:text-gray-400">No services yet. Use "Add From Catalog" to select offerings.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((s) => (
                <div key={s._id} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-card dark:shadow-dark-card hover:shadow-cardHover dark:hover:shadow-dark-glow border border-transparent dark:border-gray-700 relative transition-all duration-300">
                  <div className="absolute top-2 right-2 text-[10px] px-2 py-1 rounded-full bg-brand-primary/10 dark:bg-blue-500/20 text-brand-primary dark:text-blue-400 font-medium tracking-wide border border-brand-primary/20 dark:border-blue-500/30">LOCKED</div>
                  <h3 className="font-semibold pr-10 text-brand-gray-900 dark:text-white">{s.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{s.category}</p>
                  <p className="text-xl font-bold text-brand-primary dark:text-blue-400">₹{s.price}</p>
                  <button
                    onClick={async () => {
                      if (!window.confirm("Delete this service?")) return;
                      try {
                        await API.delete(`/services/${s._id}`);
                        loadServices();
                      } catch (e) { alert("Delete failed"); }
                    }}
                    className="w-full mt-3 px-4 py-2 text-sm text-error dark:text-red-400 border border-error/30 dark:border-red-500/30 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-all duration-300"
                  >Delete Service</button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Bookings */}
        <section>
          <h2 className="text-2xl font-semibold text-brand-gray-900 dark:text-white mb-6">Bookings</h2>
          {bookings.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">No bookings yet</p>
          ) : (
            <div className="space-y-4">
              {bookings
                // Active list: only show requested or accepted bookings that are still actionable for THIS provider.
                // Exclude:
                //  - any booking where this provider already declined its offer (providerOfferStatus === 'declined')
                //  - any booking with status rejected/cancelled/completed
                .filter(b => (
                  (b.status === 'requested' || b.status === 'accepted') &&
                  b.providerOfferStatus !== 'declined' &&
                  b.status !== 'rejected' &&
                  b.status !== 'cancelled' &&
                  b.status !== 'completed'
                ))
                .map((b) => (
                <div
                  key={b._id}
                  className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-card dark:shadow-dark-card hover:shadow-cardHover dark:hover:shadow-dark-glow border border-transparent dark:border-gray-700 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-300"
                >
                  <div>
                    <h3 className="font-semibold text-brand-gray-900 dark:text-white">
                      #{b.bookingId} • {b.service?.name}
                    </h3>
                    {b.scheduledAt && (
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                        <FiCalendar className="w-4 h-4 mr-1" />
                        <span>{new Date(b.scheduledAt).toLocaleString()}</span>
                      </div>
                    )}
                    {b.customer && (
                      <div className="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                        <p className="flex items-center">
                          <FiUser className="w-4 h-4 mr-2" />
                          <span className="text-brand-gray-900 dark:text-gray-200">{b.customer.name}</span>
                          <button
                            onClick={async ()=>{ setLoadingProfile(true); try { const { data } = await API.get(`/users/customer/${b.customer._id}`); setCustomerProfile(data); } catch { alert('Failed to load customer profile'); } finally { setLoadingProfile(false); } }}
                            className='ml-2 text-brand-primary dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-500 underline text-xs transition-colors duration-300'>View Profile</button>
                        </p>
                        {b.customer.phone && (
                          <p className="flex items-center">
                            <FiPhone className="w-4 h-4 mr-2" />
                            {b.customer.phone}
                          </p>
                        )}
                        {b.customer.address && (
                          <p className="flex items-center">
                            <FiMapPin className="w-4 h-4 mr-2" />
                            {b.customer.address}
                          </p>
                        )}
                        {b.customer.rating && (
                          <p className="flex items-center">
                            <FiStar className="w-4 h-4 mr-2 text-yellow-500 dark:text-yellow-400" />
                            {b.customer.rating}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {b.status === "requested" && (
                      <>
                        <button
                          onClick={async () => {
                            try {
                              // Use offer endpoint if offers exist (multi-provider flow)
                              if (Array.isArray(b.offers) && b.offers.length > 0) {
                                await API.patch(`/bookings/${b._id}/offer/accept`);
                              } else {
                                await API.patch(`/bookings/${b._id}/accept`);
                              }
                              loadBookings();
                            } catch(e){ alert(e?.response?.data?.message || 'Accept failed'); }
                          }}
                          className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-sm hover:shadow-md"
                        >
                          Accept
                        </button>
                        <button
                          onClick={async () => {
                            try {
                              if (Array.isArray(b.offers) && b.offers.length > 0) {
                                await API.patch(`/bookings/${b._id}/offer/decline`);
                              } else {
                                await API.patch(`/bookings/${b._id}/reject`);
                              }
                              loadBookings();
                            } catch(e){ alert(e?.response?.data?.message || 'Reject failed'); }
                          }}
                          className="px-4 py-2 border border-red-500 dark:border-red-500 text-red-500 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-all duration-300"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {b.status === "accepted" && (
                      <button
                        onClick={async () => {
                          await API.patch(`/bookings/${b._id}/complete`);
                          loadBookings();
                        }}
                        className="px-4 py-2 bg-brand-primary dark:bg-blue-500 text-white rounded-lg hover:bg-blue-600 dark:hover:bg-blue-600 transition-all duration-300 shadow-sm dark:shadow-glow-blue"
                      >
                        Mark Complete
                      </button>
                    )}
                    {b.status === "completed" && (
                      b.providerRating ? (
                        <span className="px-4 py-2 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg flex items-center border border-gray-200 dark:border-gray-600">
                          Your rating: {"⭐".repeat(b.providerRating)} ({b.providerRating}/5)
                        </span>
                      ) : (
                        <button
                          onClick={() => setRateTarget(b)}
                          className="px-4 py-2 bg-brand-primary dark:bg-blue-500 text-white rounded-lg hover:bg-blue-600 dark:hover:bg-blue-600 text-sm transition-all duration-300 shadow-sm dark:shadow-glow-blue"
                        >
                          Rate Customer
                        </button>
                      )
                    )}
                    {(b.status === "rejected" || (b.status === 'requested' && b.providerOfferStatus === 'declined')) && (
                      <span className="px-4 py-2 text-sm bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 rounded-lg flex items-center border border-red-200 dark:border-red-500/30">
                        <FiX className="mr-1" /> {b.status === 'rejected' ? 'Rejected' : 'Declined Offer'}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
      <RatingModal
        open={!!rateTarget}
        onClose={() => setRateTarget(null)}
        title="Rate this customer"
        submitting={submittingRating}
        onSubmit={async ({ rating, comment }) => {
          if(!rateTarget) return;
          try {
            setSubmittingRating(true);
            await RatingsAPI.rateCustomer({ bookingId: rateTarget._id, rating, comment });
            setRateTarget(null);
            loadBookings();
          } catch(e){
            alert(e?.response?.data?.message || 'Failed to submit rating. Please try again.');
          } finally { setSubmittingRating(false); }
        }}
      />
      {customerProfile && (
        <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300' onClick={()=>setCustomerProfile(null)}>
          <div className='bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg p-6 shadow-xl dark:shadow-dark-glow border border-transparent dark:border-gray-700 transition-all duration-300' onClick={e=>e.stopPropagation()}>
            <div className='flex items-center justify-between mb-4'>
              <h3 className='text-xl font-semibold text-brand-gray-900 dark:text-white'>{customerProfile.user.name}</h3>
              <button onClick={()=>setCustomerProfile(null)} className='text-sm text-brand-gray-500 dark:text-gray-400 hover:text-brand-gray-800 dark:hover:text-gray-200 transition-colors duration-300'>Close</button>
            </div>
            <div className='flex items-center gap-4 mb-4'>
              <div className='px-3 py-2 bg-yellow-500/10 dark:bg-yellow-500/20 rounded-lg text-sm border border-yellow-500/20 dark:border-yellow-500/30 text-brand-gray-900 dark:text-gray-100'>⭐ {customerProfile.user.rating?.toFixed?.(1) || 0} ({customerProfile.user.ratingCount || 0})</div>
              <div className='text-sm text-brand-gray-600 dark:text-gray-400'>Reviews: {customerProfile.stats.completedJobs}</div>
            </div>
            <h4 className='font-medium text-brand-gray-900 dark:text-white mb-2'>Recent Reviews</h4>
            <div className='space-y-3 max-h-60 overflow-auto pr-2'>
              {customerProfile.reviews.length === 0 && <p className='text-xs text-brand-gray-500 dark:text-gray-400'>No reviews yet.</p>}
              {customerProfile.reviews.map((r,i)=>(
                <div key={i} className='p-3 border border-brand-gray-200 dark:border-gray-700 bg-brand-gray-50 dark:bg-gray-700/40 rounded-lg text-sm transition-all duration-300'>
                  <div className='font-medium text-brand-gray-900 dark:text-gray-100 mb-1'>{'⭐'.repeat(r.rating)} <span className='text-xs text-brand-gray-500 dark:text-gray-400'>{new Date(r.createdAt).toLocaleDateString()}</span></div>
                  {r.comment && <p className='text-brand-gray-600 dark:text-gray-300 text-xs'>{r.comment}</p>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {selecting && (
        <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300' onClick={()=>!submittingSelection && setSelecting(false)}>
          <div className='bg-white dark:bg-gray-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col border border-transparent dark:border-gray-700 shadow-2xl dark:shadow-dark-glow transition-all duration-300' onClick={e=>e.stopPropagation()}>
            <div className='p-4 border-b border-brand-gray-200 dark:border-gray-700 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-800'>
              <h3 className='text-lg font-semibold text-brand-gray-900 dark:text-white'>Select Services</h3>
              <button disabled={submittingSelection} onClick={()=>setSelecting(false)} className='text-sm text-brand-gray-500 dark:text-gray-400 hover:text-brand-gray-800 dark:hover:text-gray-200 transition-colors duration-300'>Close</button>
            </div>
            <div className='p-4 overflow-y-auto grid md:grid-cols-2 lg:grid-cols-3 gap-4 bg-gray-50 dark:bg-gray-900/50'>
              {catalog.map(cat => (
                <div key={cat._id} className='border border-brand-gray-200 dark:border-gray-700 rounded-xl p-3 bg-white dark:bg-gray-800 shadow-sm dark:shadow-dark-card transition-all duration-300'>
                  <h4 className='font-medium mb-2 text-brand-gray-800 dark:text-gray-200'>{cat.name}</h4>
                  <div className='space-y-2'>
                    {cat.services.map(s => (
                      <button key={s._id} onClick={()=>toggleTemplate(s._id)} className={`w-full text-left border rounded-lg px-3 py-2 text-sm transition-all duration-300 ${
                        selectedTemplates.has(s._id) 
                          ? 'bg-brand-primary dark:bg-blue-500 text-white border-brand-primary dark:border-blue-500 shadow-md dark:shadow-glow-blue' 
                          : 'bg-white dark:bg-gray-700 text-brand-gray-900 dark:text-gray-200 border-brand-gray-200 dark:border-gray-600 hover:border-brand-primary dark:hover:border-blue-500'
                      }`}> 
                        <div className='font-medium'>{s.name}</div>
                        <div className='text-xs opacity-80'>Base ₹{s.defaultPrice}</div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              {catalog.length===0 && <p className='text-sm text-brand-gray-500 dark:text-gray-400'>No catalog services available.</p>}
            </div>
            <div className='p-4 border-t border-brand-gray-200 dark:border-gray-700 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-800'>
              <span className='text-xs text-brand-gray-500 dark:text-gray-400'>{selectedTemplates.size} selected</span>
              <button disabled={submittingSelection} onClick={submitSelection} className='px-4 py-2 bg-brand-primary dark:bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 dark:hover:bg-blue-600 transition-all duration-300 shadow-sm dark:shadow-glow-blue disabled:opacity-60'>
                {submittingSelection ? 'Adding...' : 'Add Selected'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
