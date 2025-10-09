import React, { useEffect, useState, useMemo } from "react";
import API from "../services/api";
import EnhancedRatingModal from "../components/EnhancedRatingModal";
import WaitingScreen from "../components/WaitingScreen";
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
  const [sortBy, setSortBy] = useState("balanced"); // nearest | rating | balanced
  const [providerSelect, setProviderSelect] = useState({ open: false, aggregate: null });
  const [waitingBooking, setWaitingBooking] = useState(null); // bookingId while waiting for acceptance

  const loadBookings = () => {
    API.get("/bookings/mine").then((r) => {
      const bookings = r.data.bookings || [];
      setMyBookings(bookings);
      
      // Auto-trigger rating modal for newly completed bookings
      const needsCustomerReview = bookings.find(
        b => b.status === "completed" && 
        b.reviewStatus === "provider_pending" && 
        !b.customerReviewed && 
        !rateTarget
      );
      
      if (needsCustomerReview) {
        // Auto-show rating modal for customer
        setTimeout(() => setRateTarget(needsCustomerReview), 500);
      }
    });
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

  // ✅ Fetch services + calculate distance
  useEffect(() => {
    API.get("/services")
      .then((res) => {
        let s = res.data.services || [];
        if (location.lat && location.lng) {
          s = s.map((srv) => ({
            ...srv,
            distance: getDistance(location.lat, location.lng, srv.lat, srv.lng),
          }));
        }
        setServices(s);
      })
      .catch((e) =>
        setError(e?.response?.data?.message || "Failed to load services")
      )
      .finally(() => setLoading(false));
  }, [location]);
  
  // ✅ SORTING LOGIC: Sort services based on selected mode
  const sortServices = (servicesList) => {
    return servicesList.slice().sort((a, b) => {
      const distA = a.distance || 999999;
      const distB = b.distance || 999999;
      const ratingA = a.provider?.rating || 0;
      const ratingB = b.provider?.rating || 0;

      if (sortBy === 'nearest') {
        // Sort by ascending distance
        return distA - distB;
      } else if (sortBy === 'rating') {
        // Sort by descending rating
        if (ratingB !== ratingA) return ratingB - ratingA;
        // Tiebreaker: nearest
        return distA - distB;
      } else { // balanced
        // Balanced formula: (distance × 0.7) + ((5 - rating) × 0.3)
        // Lower score is better (closer distance + higher rating)
        const scoreA = (distA * 0.7) + ((5 - ratingA) * 0.3);
        const scoreB = (distB * 0.7) + ((5 - ratingB) * 0.3);
        return scoreA - scoreB;
      }
    });
  };
  
  // Apply sorting to services
  const sortedServices = useMemo(() => {
    return sortServices(services);
  }, [services, sortBy]);


  // Aggregate duplicate services (same template or name+category) across providers
  const aggregated = useMemo(() => {
    const map = new Map();
    const sorted = sortServices(services); // Use sorted services
    for (const srv of sorted) {
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
  }, [services, sortBy]);

  const filteredAggregated = useMemo(() => {
    return aggregated.filter(a => (activeCategory === 'all' || a.category === activeCategory) && (!searchTerm || a.name.toLowerCase().includes(searchTerm.toLowerCase())));
  }, [aggregated, activeCategory, searchTerm]);

  // ✅ Poll booking status while waiting for provider acceptance
  useEffect(() => {
    if (!waitingBooking) return;
    
    const pollInterval = setInterval(async () => {
      try {
        const res = await API.get("/bookings/mine");
        const booking = res.data.bookings?.find(b => b._id === waitingBooking);
        
        if (booking && booking.status !== "requested") {
          // Provider has responded
          setWaitingBooking(null);
          loadBookings();
          
          if (booking.status === "in_progress" || booking.status === "accepted") {
            // Show success message
            alert("🎉 Your booking has been accepted! The provider will contact you soon.");
          } else if (booking.status === "rejected") {
            alert("❌ Unfortunately, this booking was declined. Please try another provider.");
          }
        }
      } catch (error) {
        console.error("Error polling booking status:", error);
      }
    }, 3000); // Poll every 3 seconds
    
    return () => clearInterval(pollInterval);
  }, [waitingBooking]);

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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-[#0f172a] dark:via-[#1e293b] dark:to-[#0f172a] text-brand-gray-900 dark:text-gray-100 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-brand-gray-900 dark:text-white mb-2 bg-clip-text dark:bg-gradient-to-r dark:from-blue-400 dark:to-blue-600 dark:text-transparent">
            Customer Dashboard
          </h1>
          <p className="text-brand-gray-600 dark:text-gray-400">
            Book services and manage your appointments
          </p>
        </div>

        {/* Browse Services Section */}
        <section className="mb-12" data-services-section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-brand-gray-900 dark:text-white">
              Browse Nearby Services
            </h2>
            <div className="text-sm text-brand-gray-500 dark:text-gray-400 hidden md:block bg-brand-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
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
                      className={`px-4 py-2 rounded-full text-sm font-medium border transition-all duration-300 ${activeCategory === cat ? 'bg-brand-primary text-white border-brand-primary shadow-glow-blue' : 'bg-white dark:bg-gray-800 text-brand-gray-700 dark:text-gray-300 border-brand-gray-200 dark:border-gray-700 hover:bg-brand-gray-50 dark:hover:bg-gray-700 dark:hover:border-blue-500/50'}`}
                    >
                      {cat === 'all' ? 'All' : cat}
                    </button>
                  ));
                })()}
              </div>
              
              {/* ✅ SORTING MODE BUTTONS */}
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-sm font-medium text-brand-gray-700 dark:text-gray-300">Sort by:</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSortBy('nearest')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all duration-300 flex items-center gap-2 ${sortBy === 'nearest' ? 'bg-brand-primary text-white border-brand-primary shadow-lg dark:shadow-blue-500/50' : 'bg-white dark:bg-gray-800 text-brand-gray-700 dark:text-gray-300 border-brand-gray-200 dark:border-gray-700 hover:bg-brand-gray-50 dark:hover:bg-gray-700 dark:hover:border-blue-500/50'}`}
                  >
                    <FiMapPin className="w-4 h-4" />
                    Nearest
                  </button>
                  <button
                    onClick={() => setSortBy('rating')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all duration-300 flex items-center gap-2 ${sortBy === 'rating' ? 'bg-brand-primary text-white border-brand-primary shadow-lg dark:shadow-blue-500/50' : 'bg-white dark:bg-gray-800 text-brand-gray-700 dark:text-gray-300 border-brand-gray-200 dark:border-gray-700 hover:bg-brand-gray-50 dark:hover:bg-gray-700 dark:hover:border-blue-500/50'}`}
                  >
                    <FiStar className="w-4 h-4" />
                    Highest Rating
                  </button>
                  <button
                    onClick={() => setSortBy('balanced')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all duration-300 flex items-center gap-2 ${sortBy === 'balanced' ? 'bg-brand-primary text-white border-brand-primary shadow-lg dark:shadow-blue-500/50' : 'bg-white dark:bg-gray-800 text-brand-gray-700 dark:text-gray-300 border-brand-gray-200 dark:border-gray-700 hover:bg-brand-gray-50 dark:hover:bg-gray-700 dark:hover:border-blue-500/50'}`}
                  >
                    <FiZap className="w-4 h-4" />
                    Balanced
                  </button>
                </div>
              </div>
              
              <div className="flex items-center gap-3 flex-wrap">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e)=>setSearchTerm(e.target.value)}
                  placeholder="Search services..."
                  className="w-full md:w-80 px-4 py-2.5 rounded-xl border border-brand-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-brand-primary dark:focus:ring-blue-500 focus:border-transparent text-sm bg-white dark:bg-gray-800 text-brand-gray-900 dark:text-gray-100 placeholder-brand-gray-400 dark:placeholder-gray-500 transition-all duration-300"
                />
              </div>
            </div>
          )}

          {loading && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse bg-white dark:bg-gray-800 rounded-xl2 h-64 border border-brand-gray-200 dark:border-gray-700"
                ></div>
              ))}
            </div>
          )}

          {error && (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl2 border border-brand-gray-200 dark:border-gray-700 dark:shadow-dark-card">
              <FiAlertCircle className="w-12 h-12 text-error mx-auto mb-4" />
              <p className="text-error dark:text-red-400 font-medium mb-2">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="text-brand-primary dark:text-blue-400 hover:underline transition-colors duration-300"
              >
                Try again
              </button>
            </div>
          )}

          {!loading && !error && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedServices
                .filter(s => {
                  const matchesCategory = activeCategory === 'all' || s.category === activeCategory;
                  const matchesSearch = !searchTerm || s.name.toLowerCase().includes(searchTerm.toLowerCase());
                  return matchesCategory && matchesSearch;
                })
                .map(service => (
                  <ServiceCard
                    key={service._id}
                    service={service}
                    onBook={() => setBookingModal({ open: true, service })}
                    variant="compact"
                  />
                ))}
            </div>
          )}

          {!loading && !error && sortedServices.filter(s => {
            const matchesCategory = activeCategory === 'all' || s.category === activeCategory;
            const matchesSearch = !searchTerm || s.name.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesCategory && matchesSearch;
          }).length === 0 && (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl2 border border-brand-gray-200 dark:border-gray-700 text-sm text-brand-gray-600 dark:text-gray-400">
              No services match your filters.
            </div>
          )}
        </section>

        {/* Provider Selection Modal */}
        {providerSelect.open && providerSelect.aggregate && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300">
            <div className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-2xl shadow-2xl dark:shadow-dark-glow border border-transparent dark:border-gray-700 transition-all duration-300 transform">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-brand-gray-900 dark:text-white">Choose Provider – {providerSelect.aggregate.name}</h3>
                  <button onClick={()=>setProviderSelect({ open:false, aggregate:null })} className="p-2 hover:bg-brand-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-300"><FiX className="w-5 h-5 dark:text-gray-300" /></button>
                </div>
                <div className="space-y-3 max-h-80 overflow-auto pr-2">
                  {sortServices(providerSelect.aggregate.services)
                    .map(srv => (
                      <div key={srv._id} className="p-3 border rounded-lg flex items-center justify-between gap-3 text-sm bg-white dark:bg-gray-700/60 border-brand-gray-200 dark:border-gray-600 hover:border-brand-primary dark:hover:border-blue-500 transition-all duration-300 dark:shadow-dark-card dark:hover:shadow-dark-glow">
                        <div className="flex-1">
                          <div className="font-medium text-brand-gray-900 dark:text-gray-100 flex items-center gap-2">
                            {srv.provider?.name || 'Provider'}
                            {srv.provider?.rating>0 && <span className="inline-flex items-center text-xs bg-yellow-500/10 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 px-1.5 py-0.5 rounded"><FiStar className="w-3 h-3 mr-0.5" />{srv.provider.rating.toFixed(1)}</span>}
                          </div>
                          <div className="text-xs text-brand-gray-500 dark:text-gray-400 flex items-center gap-2 flex-wrap">
                            <span>₹{srv.price}</span>
                            {srv.distance && <span className="flex items-center"><FiMapPin className="w-3 h-3 mr-1" />{srv.distance.toFixed(1)} km</span>}
                          </div>
                        </div>
                        <button
                          onClick={()=>{ setProviderSelect({ open:false, aggregate:null }); setBookingModal({ open:true, service: srv }); }}
                          className="px-3 py-1.5 rounded-md bg-brand-primary dark:bg-blue-500 text-white text-xs font-medium hover:bg-blue-600 dark:hover:bg-blue-600 transition-all duration-300 dark:shadow-glow-blue"
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
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300">
            <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-2xl shadow-2xl dark:shadow-dark-glow animate-scale-in border border-transparent dark:border-gray-700 transition-all duration-300">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-brand-gray-900 dark:text-white">
                    Book Service
                  </h3>
                  <button
                    onClick={() => setBookingModal({ open: false, service: null })}
                    className="p-2 hover:bg-brand-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-300"
                  >
                    <FiX className="w-5 h-5 text-brand-gray-500 dark:text-gray-400" />
                  </button>
                </div>

                <div className="mb-6 p-4 bg-brand-gray-50 dark:bg-gray-700/40 rounded-xl border border-transparent dark:border-gray-600">
                  <h4 className="font-medium text-brand-gray-900 dark:text-gray-100">
                    {bookingModal.service?.name}
                  </h4>
                  <p className="text-sm text-brand-gray-600 dark:text-gray-400 capitalize">
                    {bookingModal.service?.category}
                  </p>
                  <p className="text-lg font-bold text-brand-primary dark:text-blue-400 mt-2">
                    ₹{bookingModal.service?.price}
                  </p>
                </div>

                {bookingMsg && (
                  <div
                    className={`mb-4 p-3 rounded-lg text-sm transition-all duration-300 ${
                      bookingMsg.includes("requested")
                        ? "bg-success/10 dark:bg-success/20 text-success dark:text-green-400 border border-success/30 dark:shadow-glow-blue"
                        : "bg-error/10 dark:bg-error/20 text-error dark:text-red-400 border border-error/30"
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
                      const response = await API.post("/bookings/create", {
                        serviceId: bookingModal.service._id,
                        lng: location.lng,
                        lat: location.lat,
                        scheduledAt,
                      });
                      setBookingMsg("Booking requested successfully!");
                      loadBookings();
                      // Show waiting screen instead of closing modal immediately
                      setTimeout(() => {
                        setBookingModal({ open: false, service: null });
                        setWaitingBooking(response.data.booking._id);
                      }, 1000);
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
                      className="w-full px-4 py-3 border border-brand-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-brand-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-brand-primary dark:focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                      required
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setBookingModal({ open: false, service: null })}
                      className="flex-1 px-4 py-3 border border-brand-gray-300 dark:border-gray-600 text-brand-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-brand-gray-50 dark:hover:bg-gray-700 transition-all duration-300"
                    >
                      Cancel
                    </button>
                    <button
                      disabled={bookingLoading}
                      className="flex-1 px-4 py-3 bg-brand-primary dark:bg-blue-500 text-white font-medium rounded-xl hover:bg-blue-600 dark:hover:bg-blue-600 disabled:opacity-50 transition-all duration-300 dark:shadow-glow-blue"
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
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl2 border border-brand-gray-200 dark:border-gray-700 dark:shadow-dark-card transition-all duration-300">
              <FiCalendar className="w-12 h-12 text-brand-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-brand-gray-900 dark:text-white mb-2">
                No bookings yet
              </h3>
              <p className="text-brand-gray-600 dark:text-gray-400 mb-6">
                Book your first service to get started!
              </p>
              <button
                onClick={() =>
                  document
                    .querySelector("[data-services-section]")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="inline-flex items-center px-6 py-3 bg-brand-primary dark:bg-blue-500 text-white font-medium rounded-xl hover:bg-blue-600 dark:hover:bg-blue-600 transition-all duration-300 dark:shadow-glow-blue"
              >
                Browse Services
                <FiZap className="ml-2 w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {myBookings.map((b) => (
                <div key={b._id} className="bg-white dark:bg-gray-800 rounded-xl border border-brand-gray-200 dark:border-gray-700 shadow-card dark:shadow-dark-card hover:border-brand-primary dark:hover:border-blue-500 dark:hover:shadow-dark-glow p-6 transition-all duration-300">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className="font-semibold text-brand-gray-900 dark:text-gray-100">
                          #{b.bookingId}
                        </h3>
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border transition-colors duration-300 ${getStatusColor(
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
                        
                        {/* Review Status Badge */}
                        {b.status === "completed" && b.reviewStatus === "fully_closed" && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-700">
                            <FiCheck className="w-3 h-3 mr-1" />
                            Fully Closed
                          </span>
                        )}
                        {b.status === "completed" && b.reviewStatus === "provider_pending" && !b.customerReviewed && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-700">
                            <FiStar className="w-3 h-3 mr-1" />
                            Please Review
                          </span>
                        )}
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
                        <div className="text-xs text-brand-gray-500 dark:text-gray-400 mb-1">Assigning best provider...</div>
                      )}
                      {b.provider && (
                        <div className="flex items-center text-sm text-brand-gray-500 dark:text-gray-400 gap-2 flex-wrap">
                          <span className='flex items-center'>
                            <FiUser className="w-4 h-4 mr-1" /> {b.provider.name}
                          </span>
                          {b.provider.rating && (
                            <span className='flex items-center'>
                              <FiStar className="w-3 h-3 mr-1 text-warning dark:text-yellow-400" /> {b.provider.rating}
                            </span>
                          )}
                          <button
                            onClick={async ()=>{ setLoadingProfile(true); try { const { data } = await API.get(`/providers/${b.provider._id}/profile`); setProviderProfile(data); } catch { alert('Failed to load provider profile'); } finally { setLoadingProfile(false); } }}
                            className='text-brand-primary dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-500 text-xs underline transition-colors duration-300'>View Profile</button>
                        </div>
                      )}
                    </div>

                    <div className="text-right space-y-2">
                      <p className="font-bold text-brand-primary dark:text-blue-400 text-lg">
                        ₹{b.service?.price || 0}
                      </p>
                      <p className="text-xs text-brand-gray-500 dark:text-gray-400">Service fee</p>
                      {['requested','accepted'].includes(b.status) && (
                        <button onClick={async ()=>{ if(!window.confirm('Cancel this booking?')) return; try { await API.patch(`/bookings/${b._id}/cancel`); loadBookings(); } catch(e){ alert(e?.response?.data?.message || 'Failed to cancel'); } }} className='mt-1 inline-flex items-center px-3 py-1.5 text-xs font-medium border border-error dark:border-red-500 text-error dark:text-red-400 rounded-lg hover:bg-error/10 dark:hover:bg-red-500/20 transition-all duration-300'>Cancel</button>
                      )}
                      {b.status === 'completed' && !b.customerRating && b.provider && (
                        <button onClick={() => setRateTarget(b)} className='mt-2 inline-flex items-center px-3 py-1.5 text-xs font-medium bg-brand-primary dark:bg-blue-500 text-white rounded-lg hover:bg-blue-600 dark:hover:bg-blue-600 transition-all duration-300 dark:shadow-glow-blue'>Rate Provider</button>
                      )}
                      {b.customerRating && (
                        <div className='text-xs text-brand-gray-400 dark:text-gray-500'>Completed</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
        {providerProfile && (
          <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300' onClick={()=>setProviderProfile(null)}>
            <div className='bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg p-6 shadow-xl dark:shadow-dark-glow border border-transparent dark:border-gray-700 transition-all duration-300' onClick={e=>e.stopPropagation()}>
              <div className='flex items-center justify-between mb-4'>
                <h3 className='text-xl font-semibold text-brand-gray-900 dark:text-white'>{providerProfile.provider.name}</h3>
                <button onClick={()=>setProviderProfile(null)} className='text-sm text-brand-gray-500 dark:text-gray-400 hover:text-brand-gray-800 dark:hover:text-gray-200 transition-colors duration-300'>Close</button>
              </div>
              <div className='flex items-center gap-4 mb-4'>
                <div className='px-3 py-2 bg-yellow-500/10 dark:bg-yellow-500/20 rounded-lg text-sm text-brand-gray-900 dark:text-gray-100'>⭐ {providerProfile.provider.rating?.toFixed?.(1) || 0} ({providerProfile.provider.ratingCount || 0})</div>
                <div className='text-sm text-brand-gray-600 dark:text-gray-400'>Completed jobs: {providerProfile.stats.completedJobs}</div>
              </div>
              <h4 className='font-medium text-brand-gray-900 dark:text-white mb-2'>Recent Reviews</h4>
              <div className='space-y-3 max-h-60 overflow-auto pr-2'>
                {providerProfile.reviews.length === 0 && <p className='text-xs text-brand-gray-500 dark:text-gray-400'>No reviews yet.</p>}
                {providerProfile.reviews.map((r,i)=>(
                  <div key={i} className='p-3 border border-brand-gray-200 dark:border-gray-700 bg-brand-gray-50 dark:bg-gray-700/40 rounded-lg text-sm transition-all duration-300'>
                    <div className='font-medium text-brand-gray-900 dark:text-gray-100 mb-1'>{'⭐'.repeat(r.rating)} <span className='text-xs text-brand-gray-500 dark:text-gray-400'>{new Date(r.createdAt).toLocaleDateString()}</span></div>
                    {r.comment && <p className='text-brand-gray-600 dark:text-gray-300 text-xs'>{r.comment}</p>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        <EnhancedRatingModal
          open={!!rateTarget}
          onClose={()=>setRateTarget(null)}
          title='Rate this provider'
          submitting={submittingRating}
          userRole="customer"
          otherPartyName={rateTarget?.provider?.name || "the provider"}
          otherPartyRating={rateTarget?.provider?.rating || 0}
          otherPartyReviews={providerProfile?.reviews || []}
          showImageUpload={true}
          onSubmit={async ({ rating, comment, optionalMessage, workImages }) => {
            if(!rateTarget) return;
            try {
              setSubmittingRating(true);
              const response = await RatingsAPI.rateProvider({ 
                bookingId: rateTarget._id, 
                rating, 
                comment,
                optionalMessage,
                workImages 
              });
              setRateTarget(null);
              
              // Show success message based on review status
              if (response.data.triggerProviderReview) {
                alert("✅ Thank you for your review! The provider will now be prompted to rate you.");
              } else {
                alert("✅ Thank you for your review! Service is now fully closed.");
              }
              
              loadBookings();
            } catch(e){
              alert(e?.response?.data?.message || 'Failed to submit rating. Please try again.');
            } finally { setSubmittingRating(false); }
          }}
        />

        {/* ✅ Waiting Screen - Show while provider accepts booking */}
        <WaitingScreen
          isOpen={!!waitingBooking}
          bookingId={waitingBooking}
          onAccepted={() => {
            setWaitingBooking(null);
            loadBookings();
          }}
        />
      </div>
    </div>
  );
}
