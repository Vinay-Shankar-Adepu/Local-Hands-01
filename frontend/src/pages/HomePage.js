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
  FiMapPin, 
  FiPhone, 
  FiCalendar,
  FiCheck,
  FiX,
  FiAlertCircle,
  FiUser,
  FiBriefcase
} from "react-icons/fi";
import { Link } from "react-router-dom";

// Public / marketing style home page. Shows hero + a preview of services.
export default function HomePage() {
  const { user } = useAuth();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    API.get("/services")
      .then(r => setServices(r.data.services.slice(0, 6)))
      .catch(e => setError(e?.response?.data?.message || "Failed to load services"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-brand-light via-white to-blue-50 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-brand-primary/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-brand-secondary/5 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-6 py-20 md:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-slide-up">
              <div className="inline-flex items-center px-4 py-2 bg-brand-primary/10 text-brand-primary rounded-full text-sm font-medium mb-6">
                <FiStar className="w-4 h-4 mr-2" />
                Trusted by 1000+ customers
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight text-brand-gray-900 mb-6">
                Book trusted 
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary"> local services</span>
                <br />near you
              </h1>
              
              <p className="text-xl text-brand-gray-600 mb-8 leading-relaxed">
                From home repairs to personal care – connect with verified local professionals instantly. 
                Safe, reliable, and hassle-free.
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
                  <button className="px-6 py-4 bg-brand-primary text-white font-medium hover:bg-blue-600 transition-colors duration-200 opacity-70 cursor-not-allowed">
                    Search
                  </button>
                </div>
                <p className="text-sm text-brand-gray-500 mt-2 ml-1">Search coming soon!</p>
              </div>

              {/* Features */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-brand-primary/10 rounded-lg flex items-center justify-center">
                    <FiShield className="w-5 h-5 text-brand-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-brand-gray-900">Verified Providers</p>
                    <p className="text-sm text-brand-gray-500">Background checked</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-brand-accent/10 rounded-lg flex items-center justify-center">
                    <FiClock className="w-5 h-5 text-brand-accent" />
                  </div>
                  <div>
                    <p className="font-medium text-brand-gray-900">Quick Booking</p>
                    <p className="text-sm text-brand-gray-500">Same day service</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-brand-secondary/10 rounded-lg flex items-center justify-center">
                    <FiZap className="w-5 h-5 text-brand-secondary" />
                  </div>
                  <div>
                    <p className="font-medium text-brand-gray-900">24/7 Support</p>
                    <p className="text-sm text-brand-gray-500">Always here to help</p>
                  </div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                {!user && (
                  <>
                    <Link 
                      to="/register" 
                      className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-brand-primary to-blue-600 text-white font-semibold rounded-xl shadow-card hover:shadow-cardHover transform hover:-translate-y-0.5 transition-all duration-200"
                    >
                      Get Started
                      <FiZap className="ml-2 w-4 h-4" />
                    </Link>
                    <Link 
                      to="/login" 
                      className="inline-flex items-center justify-center px-8 py-4 border border-brand-gray-300 text-brand-gray-700 font-semibold rounded-xl hover:bg-brand-gray-50 transition-all duration-200"
                    >
                      Sign In
                    </Link>
                  </>
                )}
                {user?.role === 'customer' && (
                  <Link 
                    to="/customer" 
                    className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-brand-primary to-blue-600 text-white font-semibold rounded-xl shadow-card hover:shadow-cardHover transform hover:-translate-y-0.5 transition-all duration-200"
                  >
                    Go to Dashboard
                    <FiZap className="ml-2 w-4 h-4" />
                  </Link>
                )}
                {user?.role === 'provider' && (
                  <Link 
                    to="/provider" 
                    className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-brand-primary to-blue-600 text-white font-semibold rounded-xl shadow-card hover:shadow-cardHover transform hover:-translate-y-0.5 transition-all duration-200"
                  >
                    Provider Dashboard
                    <FiZap className="ml-2 w-4 h-4" />
                  </Link>
                )}
              </div>
            </div>
            
            {/* Hero Image */}
            <div className="relative animate-fade-in">
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=800&auto=format&fit=crop"
                  alt="Professional service providers"
                  className="w-full h-[500px] lg:h-[600px] object-cover rounded-3xl shadow-2xl"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-3xl"></div>
                
                {/* Floating Cards */}
                <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-card animate-pulse-gentle">
                  <div className="flex items-center gap-2">
                    <FiCheck className="w-5 h-5 text-success" />
                    <span className="font-medium text-brand-gray-900">Service Completed</span>
                  </div>
                  <p className="text-sm text-brand-gray-600 mt-1">Home cleaning by Sarah M.</p>
                </div>
                
                <div className="absolute bottom-6 right-6 bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-card animate-pulse-gentle" style={{animationDelay: '1s'}}>
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <FiStar key={i} className="w-4 h-4 text-warning fill-current" />
                      ))}
                    </div>
                    <span className="font-medium text-brand-gray-900">5.0</span>
                  </div>
                  <p className="text-sm text-brand-gray-600 mt-1">Amazing service!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Preview Services */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-brand-gray-900 mb-4">
              Popular <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary">Services</span>
            </h2>
            <p className="text-xl text-brand-gray-600 max-w-2xl mx-auto">
              Discover what our verified professionals can do for you
            </p>
          </div>
          
          {loading && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-brand-gray-200 rounded-xl2 h-64"></div>
                  <div className="mt-4 space-y-2">
                    <div className="h-4 bg-brand-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-brand-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {error && (
            <div className="text-center py-12">
              <FiAlertCircle className="w-12 h-12 text-error mx-auto mb-4" />
              <p className="text-error font-medium">{error}</p>
            </div>
          )}
          
          {!loading && !error && (
            <>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                {services.map(s => (
                  <ServiceCard
                    key={s._id}
                    service={{
                      ...s,
                      image: s.image || `https://images.unsplash.com/photo-1558618047-3c8c76e34c92?w=400&h=240&fit=crop&crop=center`
                    }}
                    showBookButton={false}
                  />
                ))}
              </div>
              
              {services.length > 0 && (
                <div className="text-center">
                  <Link 
                    to={user?.role === 'provider' ? '/provider' : user?.role === 'customer' ? '/customer' : '/register'} 
                    className="inline-flex items-center px-8 py-4 bg-brand-primary text-white font-semibold rounded-xl hover:bg-blue-600 transition-all duration-200 transform hover:-translate-y-0.5 shadow-card hover:shadow-cardHover"
                  >
                    {user ? 'Explore All Services' : 'Join to Book Services'}
                    <FiZap className="ml-2 w-4 h-4" />
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}

export function CustomerHome() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [bookingModal, setBookingModal] = useState({ open: false, service: null });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingMsg, setBookingMsg] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [myBookings, setMyBookings] = useState([]);
  
  const loadBookings = () => {
    API.get("/bookings/mine").then(r => setMyBookings(r.data.bookings || []));
  };
  
  useEffect(() => {
    API.get("/services")
      .then(res => setServices(res.data.services))
      .catch(e => setError(e?.response?.data?.message || "Failed to load services"))
      .finally(() => setLoading(false));
  }, []);
  
  useEffect(() => { loadBookings(); }, []);
  
  const getStatusColor = (status) => {
    switch(status) {
      case 'requested': return 'bg-warning/10 text-warning border-warning/20';
      case 'accepted': return 'bg-success/10 text-success border-success/20';
      case 'completed': return 'bg-brand-gray-100 text-brand-gray-700 border-brand-gray-200';
      case 'rejected': return 'bg-error/10 text-error border-error/20';
      default: return 'bg-brand-gray-100 text-brand-gray-700 border-brand-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-brand-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-brand-gray-900 mb-2">Customer Dashboard</h1>
          <p className="text-brand-gray-600">Book services and manage your appointments</p>
        </div>

        {/* Browse Services Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-brand-gray-900">Browse Services</h2>
            <div className="text-sm text-brand-gray-500">
              {services.length} services available
            </div>
          </div>
          
          {loading && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse bg-white rounded-xl2 h-64"></div>
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
              {services.map(s => (
                <ServiceCard
                  key={s._id}
                  service={s}
                  onBook={(service) => setBookingModal({ open: true, service })}
                  variant="compact"
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
                  <h3 className="text-xl font-semibold text-brand-gray-900">Book Service</h3>
                  <button 
                    onClick={() => setBookingModal({ open: false, service: null })}
                    className="p-2 hover:bg-brand-gray-100 rounded-lg transition-colors duration-200"
                  >
                    <FiX className="w-5 h-5 text-brand-gray-500" />
                  </button>
                </div>
                
                <div className="mb-6 p-4 bg-brand-gray-50 rounded-xl">
                  <h4 className="font-medium text-brand-gray-900">{bookingModal.service?.name}</h4>
                  <p className="text-sm text-brand-gray-600 capitalize">{bookingModal.service?.category}</p>
                  <p className="text-lg font-bold text-brand-primary mt-2">₹{bookingModal.service?.price}</p>
                </div>
                
                {bookingMsg && (
                  <div className={`mb-4 p-3 rounded-lg text-sm ${
                    bookingMsg.includes('requested') ? 'bg-success/10 text-success' : 'bg-error/10 text-error'
                  }`}>
                    {bookingMsg}
                  </div>
                )}
                
                <form
                  onSubmit={async e => {
                    e.preventDefault();
                    setBookingLoading(true); setBookingMsg("");
                    try {
                      await API.post("/bookings/create", { 
                        serviceId: bookingModal.service._id, 
                        lng: 77.5946, 
                        lat: 12.9716, 
                        scheduledAt 
                      });
                      setBookingMsg("Booking requested successfully!");
                      loadBookings();
                      setTimeout(() => setBookingModal({ open: false, service: null }), 2000);
                    } catch (er) {
                      setBookingMsg(er?.response?.data?.message || "Failed to create booking");
                    } finally { setBookingLoading(false); }
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-brand-gray-700 mb-2">
                      <FiCalendar className="inline w-4 h-4 mr-1" />
                      Preferred Date & Time
                    </label>
                    <input 
                      type="datetime-local" 
                      value={scheduledAt} 
                      onChange={e=>setScheduledAt(e.target.value)} 
                      className="w-full px-4 py-3 border border-brand-gray-300 rounded-xl focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all duration-200" 
                      required 
                    />
                  </div>
                  
                  <div className="p-3 bg-info/10 rounded-lg">
                    <div className="flex items-start gap-2">
                      <FiMapPin className="w-4 h-4 text-info mt-0.5" />
                      <div className="text-sm">
                        <p className="text-info font-medium">Service Location</p>
                        <p className="text-brand-gray-600">Currently set to Bangalore (placeholder). Location services coming soon!</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 pt-4">
                    <button 
                      type="button" 
                      onClick={() => setBookingModal({ open: false, service: null })} 
                      className="flex-1 px-4 py-3 border border-brand-gray-300 text-brand-gray-700 font-medium rounded-xl hover:bg-brand-gray-50 transition-colors duration-200"
                    >
                      Cancel
                    </button>
                    <button 
                      disabled={bookingLoading} 
                      className="flex-1 px-4 py-3 bg-brand-primary text-white font-medium rounded-xl hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:-translate-y-0.5"
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
            <h2 className="text-2xl font-semibold text-brand-gray-900">My Bookings</h2>
            {myBookings.length > 0 && (
              <div className="text-sm text-brand-gray-500">
                {myBookings.length} booking{myBookings.length !== 1 ? 's' : ''}
              </div>
            )}
          </div>
          
          {myBookings.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl2 border border-brand-gray-200">
              <FiCalendar className="w-12 h-12 text-brand-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-brand-gray-900 mb-2">No bookings yet</h3>
              <p className="text-brand-gray-600 mb-6">Book your first service to get started!</p>
              <button 
                onClick={() => document.querySelector('[data-services-section]')?.scrollIntoView({ behavior: 'smooth' })}
                className="inline-flex items-center px-6 py-3 bg-brand-primary text-white font-medium rounded-xl hover:bg-blue-600 transition-all duration-200"
              >
                Browse Services
                <FiZap className="ml-2 w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {myBookings.map(b => (
                <div key={b._id} className="bg-white rounded-xl border border-brand-gray-200 shadow-card hover:shadow-cardHover transition-all duration-200 p-6">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-brand-gray-900">#{b.bookingId}</h3>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(b.status)}`}>
                          {b.status === 'requested' && <FiClock className="w-3 h-3 mr-1" />}
                          {b.status === 'accepted' && <FiCheck className="w-3 h-3 mr-1" />}
                          {b.status === 'rejected' && <FiX className="w-3 h-3 mr-1" />}
                          {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                        </span>
                      </div>
                      
                      <p className="text-brand-gray-700 font-medium mb-1">{b.service?.name || 'Service'}</p>
                      
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
                    
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="font-bold text-brand-primary text-lg">₹{b.service?.price || 0}</p>
                        <p className="text-xs text-brand-gray-500">Service fee</p>
                      </div>
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

export function ProviderHome() {
  const [services, setServices] = useState([]);
  const [form, setForm] = useState({ name: "", category: "", price: "", duration: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]); // all provider related bookings
  const [bookingError, setBookingError] = useState("");
  const [customerDetail, setCustomerDetail] = useState(null);

  const load = () => {
    API.get("/services/mine")
      .then(r => setServices(r.data.services))
      .catch(e => {
        if (e.response?.status === 403) {
          setError("Your account is not a provider or not approved yet.");
        } else if (e.response?.status === 404) {
          setError("Services route not found. Did you restart the backend after updates?");
        } else {
          setError(e?.response?.data?.message || "Failed to load services");
        }
      });
  };
  
  const loadBookings = () => {
    API.get("/bookings/mine").then(r => {
      setBookings(r.data.bookings || []);
    }).catch(()=>{});
  };
  
  useEffect(() => { load(); }, []);
  useEffect(() => { 
    loadBookings(); 
    const iv = setInterval(loadBookings, 5000); 
    return () => clearInterval(iv); 
  }, []);

  const create = async (e) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      await API.post("/services", { ...form, price: Number(form.price) });
      setForm({ name: "", category: "", price: "", duration: "" });
      load();
    } catch (e) {
      setError(e?.response?.data?.message || "Create failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-brand-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-brand-gray-900 mb-2">Provider Dashboard</h1>
          <p className="text-brand-gray-600">Manage your services and bookings</p>
        </div>

        {/* Services Management */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-brand-gray-900 mb-6">My Services</h2>
          
          {/* Add Service Form */}
          <div className="bg-white rounded-xl2 border border-brand-gray-200 shadow-card p-6 mb-6">
            <h3 className="text-lg font-medium text-brand-gray-900 mb-4">Add New Service</h3>
            <form onSubmit={create} className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <input 
                className="px-4 py-3 border border-brand-gray-300 rounded-xl focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all duration-200" 
                placeholder="Service name" 
                value={form.name} 
                onChange={e=>setForm({...form,name:e.target.value})} 
                required 
              />
              <input 
                className="px-4 py-3 border border-brand-gray-300 rounded-xl focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all duration-200" 
                placeholder="Category" 
                value={form.category} 
                onChange={e=>setForm({...form,category:e.target.value})} 
                required 
              />
              <input 
                className="px-4 py-3 border border-brand-gray-300 rounded-xl focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all duration-200" 
                placeholder="Price (₹)" 
                type="number" 
                value={form.price} 
                onChange={e=>setForm({...form,price:e.target.value})} 
                required 
              />
              <input 
                className="px-4 py-3 border border-brand-gray-300 rounded-xl focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all duration-200" 
                placeholder="Duration (optional)" 
                value={form.duration} 
                onChange={e=>setForm({...form,duration:e.target.value})} 
              />
              <button 
                disabled={loading} 
                className="px-6 py-3 bg-brand-primary text-white font-medium rounded-xl hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:-translate-y-0.5"
              >
                {loading ? "Adding..." : "Add Service"}
              </button>
            </form>
            {error && <p className="text-error text-sm mt-3">{error}</p>}
          </div>
          
          {/* Services Grid */}
          {services.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl2 border border-brand-gray-200">
              <FiBriefcase className="w-12 h-12 text-brand-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-brand-gray-900 mb-2">No services yet</h3>
              <p className="text-brand-gray-600">Add your first service to start receiving bookings!</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map(s => (
                <div key={s._id} className="bg-white rounded-xl2 border border-brand-gray-200 shadow-card hover:shadow-cardHover transition-all duration-200 p-6">
                  <h3 className="font-semibold text-brand-gray-900 text-lg mb-1">{s.name}</h3>
                  <p className="text-brand-gray-500 text-sm mb-2 capitalize">{s.category}</p>
                  <p className="text-brand-primary font-bold text-xl mb-4">
                    ₹{s.price}
                    {s.duration && <span className="text-sm text-brand-gray-400 font-normal"> / {s.duration}</span>}
                  </p>
                  <button
                    onClick={async () => {
                      if (!window.confirm("Delete this service? This action cannot be undone.")) return;
                      try { 
                        await API.delete(`/services/${s._id}`); 
                        load(); 
                      } catch (e) { 
                        alert("Delete failed: " + (e?.response?.data?.message || "Unknown error")); 
                      }
                    }}
                    className="w-full px-4 py-2 text-sm font-medium text-error border border-error/20 hover:bg-error/10 rounded-lg transition-all duration-200"
                  >
                    Delete Service
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
        {/* Booking Management */}
        <section className="space-y-8">
          {/* Incoming Requests */}
          {(() => {
            const pending = bookings.filter(b => b.status === 'requested');
            return (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-semibold text-brand-gray-900">Incoming Requests</h2>
                  {pending.length > 0 && (
                    <span className="inline-flex items-center px-3 py-1 bg-warning/10 text-warning border border-warning/20 rounded-full text-sm font-medium">
                      {pending.length} pending
                    </span>
                  )}
                </div>
                
                {pending.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-xl2 border border-brand-gray-200">
                    <FiClock className="w-12 h-12 text-brand-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-brand-gray-900 mb-2">No pending requests</h3>
                    <p className="text-brand-gray-600">New booking requests will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pending.map(b => (
                      <div key={b._id} className="bg-white rounded-xl border border-brand-gray-200 shadow-card hover:shadow-cardHover transition-all duration-200 p-6">
                        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-brand-gray-900">Booking #{b.bookingId}</h3>
                              <span className="inline-flex items-center px-2 py-1 bg-warning/10 text-warning border border-warning/20 rounded-full text-xs font-medium">
                                <FiClock className="w-3 h-3 mr-1" />
                                New Request
                              </span>
                            </div>
                            
                            <p className="text-brand-gray-700 font-medium mb-2">{b.service?.name || '—'}</p>
                            
                            {b.scheduledAt && (
                              <div className="flex items-center text-sm text-brand-gray-500 mb-2">
                                <FiCalendar className="w-4 h-4 mr-1" />
                                <span>{new Date(b.scheduledAt).toLocaleString()}</span>
                              </div>
                            )}
                            
                            <div className="flex items-center text-sm text-brand-gray-500">
                              <FiUser className="w-4 h-4 mr-1" />
                              <span>Customer: {b.customer?.name || 'Unknown'}</span>
                              {b.customer && (
                                <button
                                  onClick={async () => {
                                    try {
                                      const { data } = await API.get(`/users/customer/${b.customer._id}`);
                                      setCustomerDetail(data.user);
                                    } catch(e) { alert('Failed to load customer details'); }
                                  }}
                                  className="ml-2 text-brand-primary hover:underline"
                                >
                                  View Details
                                </button>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <div className="text-right mr-4">
                              <p className="font-bold text-brand-primary text-lg">₹{b.service?.price || 0}</p>
                              <p className="text-xs text-brand-gray-500">Service fee</p>
                            </div>
                            
                            <button
                              onClick={async () => { 
                                try { 
                                  await API.patch(`/bookings/${b._id}/accept`); 
                                  loadBookings(); 
                                } catch(e){ 
                                  alert(e?.response?.data?.message || 'Failed to accept booking'); 
                                } 
                              }}
                              className="px-4 py-2 bg-success text-white text-sm font-medium rounded-lg hover:bg-green-600 transition-colors duration-200"
                            >
                              Accept
                            </button>
                            
                            <button
                              onClick={async () => { 
                                const reason = prompt('Reason for rejection (optional):'); 
                                try { 
                                  await API.patch(`/bookings/${b._id}/reject`, { reason }); 
                                  loadBookings(); 
                                } catch(e){ 
                                  alert(e?.response?.data?.message || 'Failed to reject booking'); 
                                } 
                              }}
                              className="px-4 py-2 border border-error text-error text-sm font-medium rounded-lg hover:bg-error/10 transition-colors duration-200"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })()}

          {/* Accepted / Upcoming */}
          {(() => {
            const accepted = bookings.filter(b => b.status === 'accepted');
            return (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-semibold text-brand-gray-900">Accepted / Upcoming</h2>
                  {accepted.length > 0 && (
                    <span className="inline-flex items-center px-3 py-1 bg-success/10 text-success border border-success/20 rounded-full text-sm font-medium">
                      {accepted.length} upcoming
                    </span>
                  )}
                </div>
                
                {accepted.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-xl2 border border-brand-gray-200">
                    <FiCalendar className="w-12 h-12 text-brand-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-brand-gray-900 mb-2">No upcoming services</h3>
                    <p className="text-brand-gray-600">Accepted bookings will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {accepted.map(b => (
                      <div key={b._id} className="bg-white rounded-xl border border-brand-gray-200 shadow-card hover:shadow-cardHover transition-all duration-200 p-6">
                        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-brand-gray-900">#{b.bookingId}</h3>
                              <span className="inline-flex items-center px-2 py-1 bg-success/10 text-success border border-success/20 rounded-full text-xs font-medium">
                                <FiCheck className="w-3 h-3 mr-1" />
                                Accepted
                              </span>
                            </div>
                            
                            <p className="text-brand-gray-700 font-medium mb-2">{b.service?.name}</p>
                            
                            {b.scheduledAt && (
                              <div className="flex items-center text-sm text-brand-gray-500 mb-2">
                                <FiCalendar className="w-4 h-4 mr-1" />
                                <span>Scheduled for {new Date(b.scheduledAt).toLocaleString()}</span>
                              </div>
                            )}
                            
                            <div className="flex items-center text-sm text-brand-gray-500">
                              <FiUser className="w-4 h-4 mr-1" />
                              <span>Customer: {b.customer?.name}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <div className="text-right mr-4">
                              <p className="font-bold text-brand-primary text-lg">₹{b.service?.price || 0}</p>
                              <p className="text-xs text-brand-gray-500">Service fee</p>
                            </div>
                            
                            <button
                              onClick={async ()=>{ 
                                if(!window.confirm('Mark this service as completed?')) return; 
                                try { 
                                  await API.patch(`/bookings/${b._id}/complete`); 
                                  loadBookings(); 
                                } catch(e){ 
                                  alert(e?.response?.data?.message || 'Failed to complete booking'); 
                                } 
                              }}
                              className="px-4 py-2 bg-brand-primary text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors duration-200"
                            >
                              Mark Complete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })()}

          {/* Completed */}
          {(() => {
            const completed = bookings.filter(b => b.status === 'completed');
            return (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-semibold text-brand-gray-900">Completed Services</h2>
                  {completed.length > 0 && (
                    <span className="inline-flex items-center px-3 py-1 bg-brand-gray-100 text-brand-gray-700 border border-brand-gray-200 rounded-full text-sm font-medium">
                      {completed.length} completed
                    </span>
                  )}
                </div>
                
                {completed.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-xl2 border border-brand-gray-200">
                    <FiCheck className="w-12 h-12 text-brand-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-brand-gray-900 mb-2">No completed services yet</h3>
                    <p className="text-brand-gray-600">Completed bookings will appear here for your records</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {completed.map(b => (
                      <div key={b._id} className="bg-white rounded-xl border border-brand-gray-200 shadow-card p-6">
                        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-brand-gray-900">#{b.bookingId}</h3>
                              <span className="inline-flex items-center px-2 py-1 bg-brand-gray-100 text-brand-gray-700 border border-brand-gray-200 rounded-full text-xs font-medium">
                                <FiCheck className="w-3 h-3 mr-1" />
                                Completed
                              </span>
                            </div>
                            
                            <p className="text-brand-gray-700 font-medium mb-2">{b.service?.name}</p>
                            
                            <div className="space-y-1 text-sm text-brand-gray-500">
                              {b.scheduledAt && (
                                <div className="flex items-center">
                                  <FiCalendar className="w-4 h-4 mr-1" />
                                  <span>Scheduled: {new Date(b.scheduledAt).toLocaleString()}</span>
                                </div>
                              )}
                              {b.completedAt && (
                                <div className="flex items-center">
                                  <FiCheck className="w-4 h-4 mr-1" />
                                  <span>Completed: {new Date(b.completedAt).toLocaleString()}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <p className="font-bold text-brand-primary text-lg">₹{b.service?.price || 0}</p>
                            <p className="text-xs text-brand-gray-500">Earned</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })()}
        </section>

        {/* Customer Detail Modal */}
        {customerDetail && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={()=>setCustomerDetail(null)}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-scale-in" onClick={e=>e.stopPropagation()}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-brand-gray-900">Customer Information</h3>
                  <button 
                    onClick={()=>setCustomerDetail(null)}
                    className="p-2 hover:bg-brand-gray-100 rounded-lg transition-colors duration-200"
                  >
                    <FiX className="w-5 h-5 text-brand-gray-500" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-brand-primary/10 rounded-full flex items-center justify-center">
                      <FiUser className="w-5 h-5 text-brand-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-brand-gray-500">Full Name</p>
                      <p className="font-medium text-brand-gray-900">{customerDetail.name}</p>
                    </div>
                  </div>
                  
                  {customerDetail.phone && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-brand-accent/10 rounded-full flex items-center justify-center">
                        <FiPhone className="w-5 h-5 text-brand-accent" />
                      </div>
                      <div>
                        <p className="text-sm text-brand-gray-500">Phone Number</p>
                        <p className="font-medium text-brand-gray-900">{customerDetail.phone}</p>
                      </div>
                    </div>
                  )}
                  
                  {customerDetail.address && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-brand-secondary/10 rounded-full flex items-center justify-center">
                        <FiMapPin className="w-5 h-5 text-brand-secondary" />
                      </div>
                      <div>
                        <p className="text-sm text-brand-gray-500">Address</p>
                        <p className="font-medium text-brand-gray-900">{customerDetail.address}</p>
                      </div>
                    </div>
                  )}
                  
                  {customerDetail.rating && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-warning/10 rounded-full flex items-center justify-center">
                        <FiStar className="w-5 h-5 text-warning" />
                      </div>
                      <div>
                        <p className="text-sm text-brand-gray-500">Customer Rating</p>
                        <p className="font-medium text-brand-gray-900">{customerDetail.rating} / 5</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="mt-6 pt-4 border-t border-brand-gray-200">
                  <p className="text-xs text-brand-gray-500 text-center">
                    Customer information is private and should only be used for service delivery.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
