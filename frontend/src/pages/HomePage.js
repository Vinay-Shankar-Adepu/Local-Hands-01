import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";
import ServiceCard from "../components/ServiceCard";
import {
  FiSearch,
  FiShield,
  FiClock,
  FiZap,
  FiStar,
  FiAlertCircle,
  FiCheck,
} from "react-icons/fi";
import { Link, Navigate } from "react-router-dom";

export default function HomePage() {
  const { user } = useAuth();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    API.get("/services")
      .then((r) => setServices(r.data.services.slice(0, 6)))
      .catch((e) =>
        setError(e?.response?.data?.message || "Failed to load services")
      )
      .finally(() => setLoading(false));
  }, []);

  // 🚀 Auto-redirect logged in users to their role home
  if (user?.role === "customer") return <Navigate to="/customer" replace />;
  if (user?.role === "provider") return <Navigate to="/provider" replace />;
  if (user?.role === "admin") return <Navigate to="/admin" replace />;

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-brand-light via-white to-blue-50 overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-6 py-20 md:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center px-4 py-2 bg-brand-primary/10 text-brand-primary rounded-full text-sm font-medium mb-6">
                <FiStar className="w-4 h-4 mr-2" />
                Trusted by 1000+ customers
              </div>

              <h1 className="text-5xl lg:text-6xl font-bold leading-tight text-brand-gray-900 mb-6">
                Book trusted
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary">
                  {" "}
                  local services
                </span>
                <br />
                near you
              </h1>

              <p className="text-xl text-brand-gray-600 mb-8 leading-relaxed">
                From home repairs to personal care – connect with verified local
                professionals instantly. Safe, reliable, and hassle-free.
              </p>

              {/* Search Bar */}
              <div className="mb-8">
                <div className="flex items-center bg-white rounded-2xl shadow-card border border-brand-gray-200 overflow-hidden max-w-md">
                  <div className="px-4 text-brand-gray-400">
                    <FiSearch className="w-5 h-5" />
                  </div>
                  <input
                    className="flex-1 py-4 px-2 outline-none text-brand-gray-700 placeholder-brand-gray-400"
                    placeholder="What service do you need?"
                    disabled
                  />
                  <button className="px-6 py-4 bg-brand-primary text-white font-medium opacity-70 cursor-not-allowed">
                    Search
                  </button>
                </div>
                <p className="text-sm text-brand-gray-500 mt-2 ml-1">
                  Search coming soon!
                </p>
              </div>

              {/* Features */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-brand-primary/10 rounded-lg flex items-center justify-center">
                    <FiShield className="w-5 h-5 text-brand-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-brand-gray-900">
                      Verified Providers
                    </p>
                    <p className="text-sm text-brand-gray-500">
                      Background checked
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-brand-accent/10 rounded-lg flex items-center justify-center">
                    <FiClock className="w-5 h-5 text-brand-accent" />
                  </div>
                  <div>
                    <p className="font-medium text-brand-gray-900">
                      Quick Booking
                    </p>
                    <p className="text-sm text-brand-gray-500">
                      Same day service
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-brand-secondary/10 rounded-lg flex items-center justify-center">
                    <FiZap className="w-5 h-5 text-brand-secondary" />
                  </div>
                  <div>
                    <p className="font-medium text-brand-gray-900">24/7 Support</p>
                    <p className="text-sm text-brand-gray-500">
                      Always here to help
                    </p>
                  </div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                {!user && (
                  <>
                    <Link
                      to="/register"
                      className="px-8 py-4 bg-gradient-to-r from-brand-primary to-blue-600 text-white font-semibold rounded-xl shadow-card"
                    >
                      Get Started
                      <FiZap className="ml-2 w-4 h-4 inline" />
                    </Link>
                    <Link
                      to="/login"
                      className="px-8 py-4 border border-brand-gray-300 text-brand-gray-700 font-semibold rounded-xl hover:bg-brand-gray-50"
                    >
                      Sign In
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Hero Image */}
            <div>
              <img
                src="https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=800&auto=format&fit=crop"
                alt="Professional services"
                className="w-full h-[500px] object-cover rounded-3xl shadow-2xl"
              />
              <div className="absolute top-6 left-6 bg-white p-4 rounded-xl shadow">
                <div className="flex items-center gap-2">
                  <FiCheck className="w-5 h-5 text-success" />
                  <span className="font-medium">Service Completed</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Home cleaning by Sarah M.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Services */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-12">
            Popular{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary">
              Services
            </span>
          </h2>

          {loading && <p className="text-center">Loading...</p>}
          {error && (
            <p className="text-center text-red-500 font-medium">{error}</p>
          )}

          {!loading && !error && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((s) => (
                <ServiceCard
                  key={s._id}
                  service={{
                    ...s,
                    image:
                      s.image ||
                      `https://images.unsplash.com/photo-1558618047-3c8c76e34c92?w=400&h=240&fit=crop`,
                  }}
                  showBookButton={false}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
