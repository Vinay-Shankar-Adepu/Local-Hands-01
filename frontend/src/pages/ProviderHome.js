import React, { useEffect, useState } from "react";
import API from "../services/api";
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
  const [form, setForm] = useState({
    name: "",
    category: "",
    price: "",
    duration: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [bookings, setBookings] = useState([]);

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

  useEffect(() => {
    loadBookings();
    const iv = setInterval(loadBookings, 5000); // auto-refresh bookings
    return () => clearInterval(iv);
  }, []);

  const createService = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await API.post("/services", { ...form, price: Number(form.price) });
      setForm({ name: "", category: "", price: "", duration: "" });
      loadServices();
    } catch (e) {
      setError(e?.response?.data?.message || "Create failed");
    } finally {
      setLoading(false);
    }
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

        {/* Add Service */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-brand-gray-900 mb-6">
            My Services
          </h2>
          <div className="bg-white p-6 rounded-xl shadow mb-6">
            <form
              onSubmit={createService}
              className="grid grid-cols-1 md:grid-cols-5 gap-4"
            >
              <input
                placeholder="Service name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="px-4 py-3 border rounded-xl"
                required
              />
              <input
                placeholder="Category"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="px-4 py-3 border rounded-xl"
                required
              />
              <input
                placeholder="Price (₹)"
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="px-4 py-3 border rounded-xl"
                required
              />
              <input
                placeholder="Duration (optional)"
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: e.target.value })}
                className="px-4 py-3 border rounded-xl"
              />
              <button
                disabled={loading}
                className="px-6 py-3 bg-brand-primary text-white rounded-xl"
              >
                {loading ? "Adding..." : "Add Service"}
              </button>
            </form>
            {error && <p className="text-error mt-3">{error}</p>}
          </div>

          {services.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border">
              <FiBriefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p>No services yet. Add one to get started!</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((s) => (
                <div key={s._id} className="bg-white p-6 rounded-xl shadow">
                  <h3 className="font-semibold">{s.name}</h3>
                  <p className="text-sm text-gray-500">{s.category}</p>
                  <p className="text-xl font-bold text-brand-primary">
                    ₹{s.price}
                  </p>
                  <button
                    onClick={async () => {
                      if (!window.confirm("Delete this service?")) return;
                      try {
                        await API.delete(`/services/${s._id}`);
                        loadServices();
                      } catch (e) {
                        alert("Delete failed");
                      }
                    }}
                    className="w-full mt-3 px-4 py-2 text-sm text-error border rounded-lg hover:bg-red-50"
                  >
                    Delete Service
                  </button>
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
              {bookings.map((b) => (
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
                            await API.patch(`/bookings/${b._id}/accept`);
                            loadBookings();
                          }}
                          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                        >
                          Accept
                        </button>
                        <button
                          onClick={async () => {
                            await API.patch(`/bookings/${b._id}/reject`);
                            loadBookings();
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
                      <span className="px-4 py-2 text-sm bg-gray-100 text-gray-600 rounded-lg flex items-center">
                        <FiCheck className="mr-1" /> Completed
                      </span>
                    )}
                    {b.status === "rejected" && (
                      <span className="px-4 py-2 text-sm bg-red-100 text-red-600 rounded-lg flex items-center">
                        <FiX className="mr-1" /> Rejected
                      </span>
                    )}
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
