import React, { useEffect, useState } from "react";
import API from "../services/api";
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
  const [location, setLocation] = useState({ lat: null, lng: null });

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
    <div className="min-h-screen bg-brand-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-brand-gray-900 mb-2">
            Customer Dashboard
          </h1>
          <p className="text-brand-gray-600">
            Book services and manage your appointments
          </p>
        </div>

        {/* Browse Services Section */}
        <section className="mb-12" data-services-section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-brand-gray-900">
              Browse Nearby Services
            </h2>
            <div className="text-sm text-brand-gray-500">
              {services.length} services available
            </div>
          </div>

          {loading && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse bg-white rounded-xl2 h-64"
                ></div>
              ))}
            </div>
          )}

          {error && (
            <div className="text-center py-12 bg-white rounded-xl2 border border-brand-gray-200">
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
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((s) => (
                <ServiceCard
                  key={s._id}
                  service={s}
                  onBook={(service) => setBookingModal({ open: true, service })}
                  variant="compact"
                  badge={
                    s.distance && (
                      <span className="inline-flex items-center px-2 py-1 text-xs bg-brand-gray-100 rounded-lg">
                        <FiMapPin className="w-3 h-3 mr-1 text-brand-primary" />
                        {s.distance.toFixed(1)} km away
                      </span>
                    )
                  }
                />
              ))}
            </div>
          )}
        </section>

        {/* Booking Modal */}
        {bookingModal.open && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl animate-scale-in">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-brand-gray-900">
                    Book Service
                  </h3>
                  <button
                    onClick={() => setBookingModal({ open: false, service: null })}
                    className="p-2 hover:bg-brand-gray-100 rounded-lg transition-colors duration-200"
                  >
                    <FiX className="w-5 h-5 text-brand-gray-500" />
                  </button>
                </div>

                <div className="mb-6 p-4 bg-brand-gray-50 rounded-xl">
                  <h4 className="font-medium text-brand-gray-900">
                    {bookingModal.service?.name}
                  </h4>
                  <p className="text-sm text-brand-gray-600 capitalize">
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
                      await API.post("/bookings/create", {
                        serviceId: bookingModal.service._id,
                        lng: location.lng,
                        lat: location.lat,
                        scheduledAt,
                      });
                      setBookingMsg("Booking requested successfully!");
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
                    <label className="block text-sm font-medium text-brand-gray-700 mb-2">
                      Preferred Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      value={scheduledAt}
                      onChange={(e) => setScheduledAt(e.target.value)}
                      className="w-full px-4 py-3 border border-brand-gray-300 rounded-xl focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                      required
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setBookingModal({ open: false, service: null })}
                      className="flex-1 px-4 py-3 border border-brand-gray-300 text-brand-gray-700 font-medium rounded-xl hover:bg-brand-gray-50"
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
            <h2 className="text-2xl font-semibold text-brand-gray-900">
              My Bookings
            </h2>
            {myBookings.length > 0 && (
              <div className="text-sm text-brand-gray-500">
                {myBookings.length} booking
                {myBookings.length !== 1 ? "s" : ""}
              </div>
            )}
          </div>

          {myBookings.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl2 border border-brand-gray-200">
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
                <div
                  key={b._id}
                  className="bg-white rounded-xl border border-brand-gray-200 shadow-card p-6"
                >
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-brand-gray-900">
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

                      <p className="text-brand-gray-700 font-medium mb-1">
                        {b.service?.name || "Service"}
                      </p>

                      {b.scheduledAt && (
                        <div className="flex items-center text-sm text-brand-gray-500 mb-1">
                          <FiCalendar className="w-4 h-4 mr-1" />
                          <span>{new Date(b.scheduledAt).toLocaleString()}</span>
                        </div>
                      )}

                      {b.provider && (
                        <div className="flex items-center text-sm text-brand-gray-500">
                          <FiUser className="w-4 h-4 mr-1" />
                          <span>Provider: {b.provider.name}</span>
                          {b.provider.rating && (
                            <>
                              <span className="mx-2">•</span>
                              <FiStar className="w-3 h-3 mr-1 text-warning" />
                              <span>{b.provider.rating}</span>
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="text-right">
                      <p className="font-bold text-brand-primary text-lg">
                        ₹{b.service?.price || 0}
                      </p>
                      <p className="text-xs text-brand-gray-500">Service fee</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
