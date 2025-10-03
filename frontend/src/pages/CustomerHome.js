import React, { useEffect, useState, useMemo } from "react";
import API from "../services/api";
import RatingModal from "../components/RatingModal";
import { RatingsAPI } from "../services/api.extras";
import ServiceCard from "../components/ServiceCard";
import {
  FiAlertCircle,
  FiCalendar,
  FiZap,
  FiClock,
  FiCheck,
  FiX,
  FiUser,
  FiStar,
  FiMapPin,
} from "react-icons/fi";

// ✅ Haversine formula for distance (km)
function getDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function CustomerHome() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [bookingModal, setBookingModal] = useState({ open: false, service: null });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingMsg, setBookingMsg] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [myBookings, setMyBookings] = useState([]);
  const [providerProfile, setProviderProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [rateTarget, setRateTarget] = useState(null); // booking to rate
  const [submittingRating, setSubmittingRating] = useState(false);
  const [location, setLocation] = useState({ lat: null, lng: null });
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [providerSelect, setProviderSelect] = useState({ open: false, aggregate: null });

  const loadBookings = () => {
    API.get("/bookings/mine").then((r) => setMyBookings(r.data.bookings || []));
  };

  // ✅ Get user location
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      () => setLocation({ lat: 12.9716, lng: 77.5946 }) // fallback → Bangalore
    );
  }, []);

  // ✅ Fetch services + sort by distance
  useEffect(() => {
    API.get("/services")
      .then((res) => {
        let s = res.data.services || [];
        if (location.lat && location.lng) {
          s = s
            .map((srv) => ({
              ...srv,
              distance: getDistance(location.lat, location.lng, srv.lat, srv.lng),
            }))
            .sort((a, b) => (a.distance || 0) - (b.distance || 0));
        }
        setServices(s);
      })
      .catch((e) =>
        setError(e?.response?.data?.message || "Failed to load services")
      )
      .finally(() => setLoading(false));
  }, [location]);

  // Aggregate duplicate services (same template or name+category) across providers
  const aggregated = useMemo(() => {
    const map = new Map();
    for (const srv of services) {
      const key = srv.template || `${srv.name}::${srv.category}`;
      if (!map.has(key)) {
        map.set(key, {
          key,
          name: srv.name,
          category: srv.category,
          basePrice: srv.price,
          template: srv.template,
          services: [srv],
          providerCount: 1,
        });
      } else {
        const agg = map.get(key);
        agg.services.push(srv);
        agg.providerCount = agg.services.length;
      }
    }
    return Array.from(map.values());
  }, [services]);

  const filteredAggregated = useMemo(() => {
    return aggregated.filter(a => (activeCategory === 'all' || a.category === activeCategory) && (!searchTerm || a.name.toLowerCase().includes(searchTerm.toLowerCase())));
  }, [aggregated, activeCategory, searchTerm]);

  const openBook = (aggregate) => {
    if (!aggregate) return;
    if (aggregate.services.length === 1) {
      setBookingModal({ open: true, service: aggregate.services[0] });
    } else {
      // Multi-provider flow: directly create multi booking using template if available
      if(aggregate.template){
        // open a lightweight modal just asking for schedule, or reuse existing booking modal with neutral service
        setBookingModal({ open: true, service: { ...aggregate.services[0], _aggregateTemplate: aggregate.template, _multi: true } });
      } else {
        setProviderSelect({ open: true, aggregate });
      }
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "requested":
        return "bg-warning/10 text-warning border-warning/20";
      case "accepted":
        return "bg-success/10 text-success border-success/20";
      case "completed":
        return "bg-brand-gray-100 text-brand-gray-700 border-brand-gray-200";
      case "rejected":
        return "bg-error/10 text-error border-error/20";
      default:
        return "bg-brand-gray-100 text-brand-gray-700 border-brand-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-brand-gray-50 dark:bg-gray-900 text-brand-gray-900 dark:text-gray-100 transition-colors">
      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-brand-gray-900 dark:text-white mb-2">
            Customer Dashboard
          </h1>
          <p className="text-brand-gray-600 dark:text-gray-300">
            Book services and manage your appointments
          </p>
        </div>

        {/* Browse Services Section */}
        <section className="mb-12" data-services-section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-brand-gray-900 dark:text-white">
              Browse Nearby Services
            </h2>
            <div className="text-sm text-brand-gray-500 dark:text-gray-400 hidden md:block">
              {services.length} services available
            </div>
          </div>

          {/* Category Pills & Search */}
          {!loading && !error && services.length > 0 && (
            <div className="mb-6 space-y-4">
              <div className="flex flex-wrap gap-2">
                {(() => {
                  const categories = Array.from(new Set(services.map(s => s.category)));
                  const items = ["all", ...categories];
                  return items.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${activeCategory === cat ? 'bg-brand-primary text-white border-brand-primary' : 'bg-white dark:bg-gray-800 text-brand-gray-700 dark:text-gray-300 border-brand-gray-200 dark:border-gray-700 hover:bg-brand-gray-50 dark:hover:bg-gray-700'}`}
                    >
                      {cat === 'all' ? 'All' : cat}
                    </button>
                  ));
                })()}
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e)=>setSearchTerm(e.target.value)}
                  placeholder="Search services..."
                  className="w-full md:w-80 px-4 py-2.5 rounded-xl border border-brand-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-brand-primary focus:border-transparent text-sm bg-white dark:bg-gray-800 text-brand-gray-900 dark:text-gray-100 placeholder-brand-gray-400 dark:placeholder-gray-500"
                />
                <div className="text-xs text-brand-gray-500 dark:text-gray-400">Showing {filteredAggregated.length} result(s)</div>
              </div>
            </div>
          )}

          {loading && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse bg-white dark:bg-gray-800 rounded-xl2 h-64"
                ></div>
              ))}
            </div>
          )}

          {error && (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl2 border border-brand-gray-200 dark:border-gray-700">
              <FiAlertCircle className="w-12 h-12 text-error mx-auto mb-4" />
              <p className="text-error font-medium mb-2">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="text-brand-primary hover:underline"
              >
                Try again
              </button>
            </div>
          )}

          {!loading && !error && (
            (() => {
              if(filteredAggregated.length === 0) {
                return <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl2 border border-brand-gray-200 dark:border-gray-700 text-sm text-brand-gray-600 dark:text-gray-400">No services match your filters.</div>;
              }
              const categories = activeCategory === 'all' ? Array.from(new Set(filteredAggregated.map(s=>s.category))) : [activeCategory];
              return (
                <div className="space-y-10">
                  {categories.map(cat => {
                    const catAggs = filteredAggregated.filter(a=>a.category === cat);
                    return (
                      <div key={cat} id={cat.replace(/[^a-z0-9]+/gi,'-').toLowerCase()}>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-brand-gray-900 dark:text-white">{cat}</h3>
                          <span className="text-xs text-brand-gray-500 dark:text-gray-400">{catAggs.length} service{catAggs.length!==1 && 's'}</span>
                        </div>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                          {catAggs.map(a => {
                            const display = a.services[0];
                            return (
                              <div key={a.key} className="relative">
                                {a.providerCount>1 && (
                                  <div className="absolute top-2 right-2 z-10 text-[10px] bg-brand-primary text-white px-2 py-0.5 rounded-full shadow-sm">{a.providerCount} providers</div>
                                )}
                                <ServiceCard
                                  service={display}
                                  onBook={() => openBook(a)}
                                  variant="compact"
                                />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()
          )}
        </section>

        {/* Provider Selection Modal */}
        {providerSelect.open && providerSelect.aggregate && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-2xl shadow-2xl border border-transparent dark:border-gray-700 transition-colors">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Choose Provider – {providerSelect.aggregate.name}</h3>
                  <button onClick={()=>setProviderSelect({ open:false, aggregate:null })} className="p-2 hover:bg-brand-gray-100 dark:hover:bg-gray-700 rounded-lg"><FiX className="w-5 h-5" /></button>
                </div>
                <div className="space-y-3 max-h-80 overflow-auto pr-2">
                  {providerSelect.aggregate.services
                    .slice()
                    .sort((a,b)=>{
                      const da = a.distance ?? 999999;
                      const db = b.distance ?? 999999;
                      if(da!==db) return da-db;
                      return (b.rating||0) - (a.rating||0);
                    })
                    .map(srv => (
                      <div key={srv._id} className="p-3 border rounded-lg flex items-center justify-between gap-3 text-sm bg-white dark:bg-gray-700/60 border-brand-gray-200 dark:border-gray-600">
                        <div className="flex-1">
                          <div className="font-medium text-brand-gray-900 dark:text-gray-100 flex items-center gap-2">
                            {srv.provider?.name || 'Provider'}
                            {srv.provider?.rating>0 && <span className="inline-flex items-center text-xs bg-yellow-500/10 text-yellow-700 px-1.5 py-0.5 rounded"><FiStar className="w-3 h-3 mr-0.5" />{srv.provider.rating.toFixed(1)}</span>}
                          </div>
                          <div className="text-xs text-brand-gray-500 dark:text-gray-400 flex items-center gap-2 flex-wrap">
                            <span>₹{srv.price}</span>
                            {srv.distance && <span className="flex items-center"><FiMapPin className="w-3 h-3 mr-1" />{srv.distance.toFixed(1)} km</span>}
                          </div>
                        </div>
                        <button
                          onClick={()=>{ setProviderSelect({ open:false, aggregate:null }); setBookingModal({ open:true, service: srv }); }}
                          className="px-3 py-1.5 rounded-md bg-brand-primary text-white text-xs font-medium hover:bg-blue-600"
                        >Select</button>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Booking Modal */}
        {bookingModal.open && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-2xl shadow-2xl animate-scale-in border border-transparent dark:border-gray-700 transition-colors">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-brand-gray-900">
                    Book Service
                  </h3>
                  <button
                    onClick={() => setBookingModal({ open: false, service: null })}
                    className="p-2 hover:bg-brand-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                  >
                    <FiX className="w-5 h-5 text-brand-gray-500" />
                  </button>
                </div>

                <div className="mb-6 p-4 bg-brand-gray-50 dark:bg-gray-700/40 rounded-xl">
                  <h4 className="font-medium text-brand-gray-900 dark:text-gray-100">
                    {bookingModal.service?.name}
                  </h4>
                  <p className="text-sm text-brand-gray-600 dark:text-gray-400 capitalize">
                    {bookingModal.service?.category}
                  </p>
                  <p className="text-lg font-bold text-brand-primary mt-2">
                    ₹{bookingModal.service?.price}
                  </p>
                </div>

                {bookingMsg && (
                  <div
                    className={`mb-4 p-3 rounded-lg text-sm ${
                      bookingMsg.includes("requested")
                        ? "bg-success/10 text-success"
                        : "bg-error/10 text-error"
                    }`}
                  >
                    {bookingMsg}
                  </div>
                )}

                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setBookingLoading(true);
                    setBookingMsg("");
                    try {
                      if(bookingModal.service?._multi && bookingModal.service?._aggregateTemplate){
                        await API.post('/bookings/create-multi', {
                          templateId: bookingModal.service._aggregateTemplate,
                          lng: location.lng,
                          lat: location.lat,
                          scheduledAt,
                        });
                        setBookingMsg('Request sent. The best available provider will be assigned shortly.');
                      } else {
                        await API.post("/bookings/create", {
                          serviceId: bookingModal.service._id,
                          lng: location.lng,
                          lat: location.lat,
                          scheduledAt,
                        });
                        setBookingMsg("Booking requested successfully!");
                      }
                      loadBookings();
                      setTimeout(
                        () => setBookingModal({ open: false, service: null }),
                        2000
                      );
                    } catch (er) {
                      setBookingMsg(
                        er?.response?.data?.message || "Failed to create booking"
                      );
                    } finally {
                      setBookingLoading(false);
                    }
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-brand-gray-700 dark:text-gray-300 mb-2">
                      Preferred Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      value={scheduledAt}
                      onChange={(e) => setScheduledAt(e.target.value)}
                      className="w-full px-4 py-3 border border-brand-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-brand-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                      required
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setBookingModal({ open: false, service: null })}
                      className="flex-1 px-4 py-3 border border-brand-gray-300 dark:border-gray-600 text-brand-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-brand-gray-50 dark:hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                    <button
                      disabled={bookingLoading}
                      className="flex-1 px-4 py-3 bg-brand-primary text-white font-medium rounded-xl hover:bg-blue-600 disabled:opacity-50"
                    >
                      {bookingLoading ? "Requesting..." : "Confirm Booking"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* My Bookings Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-brand-gray-900 dark:text-white">
              My Bookings
            </h2>
            {myBookings.length > 0 && (
              <div className="text-sm text-brand-gray-500 dark:text-gray-400">
                {myBookings.length} booking
                {myBookings.length !== 1 ? "s" : ""}
              </div>
            )}
          </div>

          {myBookings.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl2 border border-brand-gray-200 dark:border-gray-700">
              <FiCalendar className="w-12 h-12 text-brand-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-brand-gray-900 mb-2">
                No bookings yet
              </h3>
              <p className="text-brand-gray-600 mb-6">
                Book your first service to get started!
              </p>
              <button
                onClick={() =>
                  document
                    .querySelector("[data-services-section]")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="inline-flex items-center px-6 py-3 bg-brand-primary text-white font-medium rounded-xl hover:bg-blue-600"
              >
                Browse Services
                <FiZap className="ml-2 w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {myBookings.map((b) => (
                <div key={b._id} className="bg-white dark:bg-gray-800 rounded-xl border border-brand-gray-200 dark:border-gray-700 shadow-card dark:shadow-none p-6 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-brand-gray-900 dark:text-gray-100">
                          #{b.bookingId}
                        </h3>
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                            b.status
                          )}`}
                        >
                          {b.status === "requested" && (
                            <FiClock className="w-3 h-3 mr-1" />
                          )}
                          {b.status === "accepted" && (
                            <FiCheck className="w-3 h-3 mr-1" />
                          )}
                          {b.status === "rejected" && (
                            <FiX className="w-3 h-3 mr-1" />
                          )}
                          {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                        </span>
                      </div>

                      <p className="text-brand-gray-700 dark:text-gray-300 font-medium mb-1">
                        {b.service?.name || b.serviceTemplate?.name || "Service"}
                      </p>

                      {b.scheduledAt && (
                        <div className="flex items-center text-sm text-brand-gray-500 dark:text-gray-400 mb-1">
                          <FiCalendar className="w-4 h-4 mr-1" />
                          <span>{new Date(b.scheduledAt).toLocaleString()}</span>
                        </div>
                      )}

                      {(!b.provider && b.status==='requested') && (
                        <div className="text-xs text-brand-gray-500 mb-1">Assigning best provider...</div>
                      )}
                      {b.provider && (
                        <div className="flex items-center text-sm text-brand-gray-500 dark:text-gray-400 gap-2 flex-wrap">
                          <span className='flex items-center'>
                            <FiUser className="w-4 h-4 mr-1" /> {b.provider.name}
                          </span>
                          {b.provider.rating && (
                            <span className='flex items-center'>
                              <FiStar className="w-3 h-3 mr-1 text-warning" /> {b.provider.rating}
                            </span>
                          )}
                          <button
                            onClick={async ()=>{ setLoadingProfile(true); try { const { data } = await API.get(`/providers/${b.provider._id}/profile`); setProviderProfile(data); } catch { alert('Failed to load provider profile'); } finally { setLoadingProfile(false); } }}
                            className='text-brand-primary hover:text-blue-600 text-xs underline'>View Profile</button>
                        </div>
                      )}
                    </div>

                    <div className="text-right space-y-2">
                      <p className="font-bold text-brand-primary text-lg">
                        ₹{b.service?.price || 0}
                      </p>
                      <p className="text-xs text-brand-gray-500">Service fee</p>
                      {['requested','accepted'].includes(b.status) && (
                        <button onClick={async ()=>{ if(!window.confirm('Cancel this booking?')) return; try { await API.patch(`/bookings/${b._id}/cancel`); loadBookings(); } catch(e){ alert(e?.response?.data?.message || 'Failed to cancel'); } }} className='mt-1 inline-flex items-center px-3 py-1.5 text-xs font-medium border border-error text-error rounded-lg hover:bg-error/10'>Cancel</button>
                      )}
                      {b.status === 'completed' && !b.customerRating && b.provider && (
                        <button onClick={() => setRateTarget(b)} className='mt-2 inline-flex items-center px-3 py-1.5 text-xs font-medium bg-brand-primary text-white rounded-lg hover:bg-blue-600'>Rate Provider</button>
                      )}
                      {b.customerRating && (
                        <div className='text-xs text-brand-gray-400'>Completed</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
        {providerProfile && (
          <div className='fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4' onClick={()=>setProviderProfile(null)}>
            <div className='bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg p-6 shadow-xl border border-transparent dark:border-gray-700 transition-colors' onClick={e=>e.stopPropagation()}>
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
        <RatingModal
          open={!!rateTarget}
          onClose={()=>setRateTarget(null)}
          title='Rate this provider'
          submitting={submittingRating}
          onSubmit={async ({ rating, comment }) => {
            if(!rateTarget) return;
            try {
              setSubmittingRating(true);
              await RatingsAPI.rateProvider({ bookingId: rateTarget._id, rating, comment });
              setRateTarget(null);
              loadBookings();
            } catch(e){
              alert(e?.response?.data?.message || 'Failed to submit rating. Please try again.');
            } finally { setSubmittingRating(false); }
          }}
        />
      </div>
    </div>
  );
}
