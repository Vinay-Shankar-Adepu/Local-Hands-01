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
    <div className="min-h-screen bg-brand-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-brand-gray-900 mb-2">
              Provider Dashboard
            </h1>
            <p className="text-brand-gray-600">
              Manage your services and bookings
            </p>
          </div>
          <Link
            to="/provider/history"
            className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-xl shadow hover:bg-blue-600"
          >
            <FiClock className="w-4 h-4" /> {/* ✅ replaced FiHistory */}
            View History
          </Link>
        </div>

        {/* Services Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-brand-gray-900 mb-6">
            My Services
          </h2>
          <div className="bg-white p-6 rounded-xl shadow mb-6 flex items-center justify-between gap-4 flex-wrap">
            <p className="text-sm text-brand-gray-600">Services are now selected from the curated catalog.</p>
            <button onClick={openSelection} className="px-4 py-2 bg-brand-primary text-white rounded-lg text-sm">Add From Catalog</button>
          </div>

          {services.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border">
              <FiBriefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p>No services yet. Use "Add From Catalog" to select offerings.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((s) => (
                <div key={s._id} className="bg-white p-6 rounded-xl shadow relative">
                  <div className="absolute top-2 right-2 text-[10px] px-2 py-1 rounded-full bg-brand-primary/10 text-brand-primary font-medium tracking-wide">LOCKED</div>
                  <h3 className="font-semibold pr-10">{s.name}</h3>
                  <p className="text-sm text-gray-500">{s.category}</p>
                  <p className="text-xl font-bold text-brand-primary">₹{s.price}</p>
                  <button
                    onClick={async () => {
                      if (!window.confirm("Delete this service?")) return;
                      try {
                        await API.delete(`/services/${s._id}`);
                        loadServices();
                      } catch (e) { alert("Delete failed"); }
                    }}
                    className="w-full mt-3 px-4 py-2 text-sm text-error border rounded-lg hover:bg-red-50"
                  >Delete Service</button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Bookings */}
        <section>
          <h2 className="text-2xl font-semibold mb-6">Bookings</h2>
          {bookings.length === 0 ? (
            <p className="text-gray-600">No bookings yet</p>
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
                  className="bg-white p-6 rounded-xl shadow flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div>
                    <h3 className="font-semibold text-brand-gray-900">
                      #{b.bookingId} • {b.service?.name}
                    </h3>
                    {b.scheduledAt && (
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <FiCalendar className="w-4 h-4 mr-1" />
                        <span>{new Date(b.scheduledAt).toLocaleString()}</span>
                      </div>
                    )}
                    {b.customer && (
                      <div className="mt-2 space-y-1 text-sm text-gray-600">
                        <p className="flex items-center">
                          <FiUser className="w-4 h-4 mr-2" />
                          {b.customer.name}
                          <button
                            onClick={async ()=>{ setLoadingProfile(true); try { const { data } = await API.get(`/users/customer/${b.customer._id}`); setCustomerProfile(data); } catch { alert('Failed to load customer profile'); } finally { setLoadingProfile(false); } }}
                            className='ml-2 text-brand-primary underline text-xs'>View Profile</button>
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
                            <FiStar className="w-4 h-4 mr-2 text-yellow-500" />
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
                          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
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
                          className="px-4 py-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-50"
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
                        className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-blue-600"
                      >
                        Mark Complete
                      </button>
                    )}
                    {b.status === "completed" && (
                      b.providerRating ? (
                        <span className="px-4 py-2 text-xs bg-gray-100 text-gray-600 rounded-lg flex items-center">
                          Your rating: {"⭐".repeat(b.providerRating)} ({b.providerRating}/5)
                        </span>
                      ) : (
                        <button
                          onClick={() => setRateTarget(b)}
                          className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-blue-600 text-sm"
                        >
                          Rate Customer
                        </button>
                      )
                    )}
                    {(b.status === "rejected" || (b.status === 'requested' && b.providerOfferStatus === 'declined')) && (
                      <span className="px-4 py-2 text-sm bg-red-100 text-red-600 rounded-lg flex items-center">
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
        <div className='fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4' onClick={()=>setCustomerProfile(null)}>
          <div className='bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl' onClick={e=>e.stopPropagation()}>
            <div className='flex items-center justify-between mb-4'>
              <h3 className='text-xl font-semibold'>{customerProfile.user.name}</h3>
              <button onClick={()=>setCustomerProfile(null)} className='text-sm text-brand-gray-500 hover:text-brand-gray-800'>Close</button>
            </div>
            <div className='flex items-center gap-4 mb-4'>
              <div className='px-3 py-2 bg-yellow-500/10 rounded-lg text-sm'>⭐ {customerProfile.user.rating?.toFixed?.(1) || 0} ({customerProfile.user.ratingCount || 0})</div>
              <div className='text-sm text-brand-gray-600'>Reviews: {customerProfile.stats.completedJobs}</div>
            </div>
            <h4 className='font-medium mb-2'>Recent Reviews</h4>
            <div className='space-y-3 max-h-60 overflow-auto pr-2'>
              {customerProfile.reviews.length === 0 && <p className='text-xs text-brand-gray-500'>No reviews yet.</p>}
              {customerProfile.reviews.map((r,i)=>(
                <div key={i} className='p-3 border rounded-lg text-sm'>
                  <div className='font-medium mb-1'>{'⭐'.repeat(r.rating)} <span className='text-xs text-brand-gray-500'>{new Date(r.createdAt).toLocaleDateString()}</span></div>
                  {r.comment && <p className='text-brand-gray-600 text-xs'>{r.comment}</p>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {selecting && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4' onClick={()=>!submittingSelection && setSelecting(false)}>
          <div className='bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col' onClick={e=>e.stopPropagation()}>
            <div className='p-4 border-b flex items-center justify-between'>
              <h3 className='text-lg font-semibold'>Select Services</h3>
              <button disabled={submittingSelection} onClick={()=>setSelecting(false)} className='text-sm text-brand-gray-500 hover:text-brand-gray-800'>Close</button>
            </div>
            <div className='p-4 overflow-y-auto grid md:grid-cols-2 lg:grid-cols-3 gap-4'>
              {catalog.map(cat => (
                <div key={cat._id} className='border rounded-xl p-3'>
                  <h4 className='font-medium mb-2 text-brand-gray-800'>{cat.name}</h4>
                  <div className='space-y-2'>
                    {cat.services.map(s => (
                      <button key={s._id} onClick={()=>toggleTemplate(s._id)} className={`w-full text-left border rounded-lg px-3 py-2 text-sm transition ${selectedTemplates.has(s._id) ? 'bg-brand-primary text-white border-brand-primary' : 'hover:border-brand-primary/50'}`}> 
                        <div className='font-medium'>{s.name}</div>
                        <div className='text-xs opacity-80'>Base ₹{s.defaultPrice}</div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              {catalog.length===0 && <p className='text-sm text-brand-gray-500'>No catalog services available.</p>}
            </div>
            <div className='p-4 border-t flex items-center justify-between'>
              <span className='text-xs text-brand-gray-500'>{selectedTemplates.size} selected</span>
              <button disabled={submittingSelection} onClick={submitSelection} className='px-4 py-2 bg-brand-primary text-white rounded-lg text-sm'>
                {submittingSelection ? 'Adding...' : 'Add Selected'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
