import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";
import ServiceCard from "../components/ServiceCard";
import { FiSearch, FiShield, FiClock, FiZap } from "react-icons/fi";
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
      {/* Hero */}
      <section className="bg-gradient-to-br from-white to-brand-light">
        <div className="max-w-7xl mx-auto px-6 py-16 md:py-24 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight text-brand-dark">
              Book trusted services <span className="text-brand-primary">near you</span>
            </h1>
            <p className="mt-5 text-lg text-gray-600">
              From rides to repairs & cleaning – connect with vetted local providers instantly.
            </p>

            <div className="mt-6 flex items-center bg-white rounded-xl shadow-card overflow-hidden">
              <span className="px-3 text-gray-500"><FiSearch /></span>
              <input
                className="flex-1 p-3 outline-none"
                placeholder="Search (coming soon)"
                disabled
              />
              <button className="px-5 py-3 bg-brand-primary text-white font-semibold opacity-70 cursor-not-allowed">
                Search
              </button>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2"><FiShield className="text-brand-primary" /> Vetted pros</div>
              <div className="flex items-center gap-2"><FiClock className="text-brand-primary" /> Quick booking</div>
              <div className="flex items-center gap-2"><FiZap className="text-brand-primary" /> Fast support</div>
            </div>

            <div className="mt-8 flex gap-4">
              {!user && <Link to="/register" className="px-6 py-3 rounded-lg bg-brand-primary text-white font-semibold shadow hover:bg-blue-600">Get Started</Link>}
              {user?.role === 'customer' && <Link to="/customer" className="px-6 py-3 rounded-lg bg-brand-primary text-white font-semibold shadow">Go to Customer Area</Link>}
              {user?.role === 'provider' && <Link to="/provider" className="px-6 py-3 rounded-lg bg-brand-primary text-white font-semibold shadow">Provider Dashboard</Link>}
            </div>
          </div>
          <img
            src="https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=1600&auto=format&fit=crop"
            alt="Hero"
            className="w-full h-80 md:h-[28rem] object-cover rounded-2xl shadow-card"
          />
        </div>
      </section>

      {/* Preview Services */}
      <section className="py-14">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-bold">Popular services</h2>
          <p className="text-gray-600 mt-1">A quick look at what providers offer</p>
          {loading && <p className="mt-6 text-sm text-gray-500">Loading services...</p>}
          {error && <p className="mt-6 text-sm text-red-600">{error}</p>}
          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-7">
            {services.map(s => (
              <ServiceCard
                key={s._id}
                service={{
                  ...s,
                  image: "https://via.placeholder.com/400x240?text=" + encodeURIComponent(s.name)
                }}
              />
            ))}
          </div>
          {services.length > 0 && <div className="mt-8"><Link to={user?.role === 'provider' ? '/provider' : user?.role === 'customer' ? '/customer' : '/register'} className="text-brand-primary font-semibold hover:underline">{user ? 'View more services' : 'Join to book services →'}</Link></div>}
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
  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <h2 className="text-2xl font-bold mb-4">Browse Services</h2>
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map(s => (
          <div key={s._id} className="bg-white rounded-2xl shadow-card p-5 flex flex-col">
            <h3 className="font-semibold mb-1">{s.name}</h3>
            <p className="text-sm text-gray-500 mb-2">{s.category}</p>
            <p className="text-brand-dark font-medium mb-4">₹{s.price}{s.duration && <span className="text-xs text-gray-400"> / {s.duration}</span>}</p>
            <button
              onClick={() => setBookingModal({ open: true, service: s })}
              className="mt-auto px-4 py-2 bg-brand-primary text-white rounded hover:bg-blue-600"
            >Book</button>
          </div>
        ))}
      </div>
      {bookingModal.open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold mb-2">Request Booking</h3>
            <p className="text-sm text-gray-600 mb-4">{bookingModal.service.name}</p>
            {bookingMsg && <p className="text-sm mb-2 text-green-600">{bookingMsg}</p>}
            <form
              onSubmit={async e => {
                e.preventDefault();
                setBookingLoading(true); setBookingMsg("");
                try {
                  // For now use dummy coordinates; later integrate map / geolocation
                  await API.post("/bookings/create", { serviceId: bookingModal.service._id, lng: 77.5946, lat: 12.9716, scheduledAt });
                  setBookingMsg("Booking requested!");
                  loadBookings();
                } catch (er) {
                  setBookingMsg(er?.response?.data?.message || "Failed to create booking");
                } finally { setBookingLoading(false); }
              }}
              className="space-y-4"
            >
              <label className="block">
                <span className="text-xs text-gray-500">Choose date & time</span>
                <input type="datetime-local" value={scheduledAt} onChange={e=>setScheduledAt(e.target.value)} className="mt-1 w-full border rounded p-2 text-sm" required />
              </label>
              <div className="text-xs text-gray-500">Location is currently set to a placeholder (Bangalore). Geolocation integration to follow.</div>
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => setBookingModal({ open: false, service: null })} className="px-4 py-2 rounded border">Close</button>
                <button disabled={bookingLoading} className="px-4 py-2 rounded bg-brand-primary text-white">{bookingLoading?"Requesting...":"Confirm"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
      <div className="mt-14">
        <h2 className="text-xl font-bold mb-3">My Bookings</h2>
        <div className="space-y-2">
          {myBookings.length === 0 && <p className="text-sm text-gray-500">No bookings yet.</p>}
          {myBookings.map(b => (
            <div key={b._id} className="bg-white shadow rounded p-4 text-sm flex flex-col md:flex-row md:items-center gap-2">
              <div className="flex-1">
                <span className="font-medium">#{b.bookingId}</span> – {b.service?.name} – <span className="capitalize">{b.status}</span>
                {b.scheduledAt && <span className="text-xs text-gray-500 ml-2">{new Date(b.scheduledAt).toLocaleString()}</span>}
              </div>
              {b.status === 'accepted' && <span className="text-green-600 text-xs">Provider accepted</span>}
              {b.status === 'rejected' && <span className="text-red-600 text-xs">Rejected</span>}
            </div>
          ))}
        </div>
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
  const [bookings, setBookings] = useState([]);
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
      const pending = (r.data.bookings || []).filter(b => b.status === 'requested');
      setBookings(pending);
    }).catch(()=>{});
  };
  useEffect(() => { load(); }, []);
  useEffect(() => { loadBookings(); const iv = setInterval(loadBookings, 5000); return () => clearInterval(iv); }, []);

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
    <div className="max-w-7xl mx-auto px-6 py-10">
      <h2 className="text-2xl font-bold mb-4">My Services</h2>
      <form onSubmit={create} className="grid md:grid-cols-5 gap-3 mb-6">
        <input className="border p-2 rounded" placeholder="Name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required />
        <input className="border p-2 rounded" placeholder="Category" value={form.category} onChange={e=>setForm({...form,category:e.target.value})} required />
        <input className="border p-2 rounded" placeholder="Price" type="number" value={form.price} onChange={e=>setForm({...form,price:e.target.value})} required />
        <input className="border p-2 rounded" placeholder="Duration" value={form.duration} onChange={e=>setForm({...form,duration:e.target.value})} />
        <button disabled={loading} className="bg-brand-primary text-white rounded px-4">{loading?"Saving...":"Add"}</button>
      </form>
      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map(s => (
          <div key={s._id} className="bg-white rounded-2xl shadow-card p-5 flex flex-col">
            <h3 className="font-semibold mb-1">{s.name}</h3>
            <p className="text-sm text-gray-500 mb-2">{s.category}</p>
            <p className="text-brand-dark font-medium mb-4">₹{s.price}{s.duration && <span className="text-xs text-gray-400"> / {s.duration}</span>}</p>
            <div className="mt-auto flex gap-2">
              <button
                onClick={async () => {
                  if (!window.confirm("Delete this service?")) return;
                  try { await API.delete(`/services/${s._id}`); load(); } catch (e) { alert("Delete failed"); }
                }}
                className="px-3 py-1 text-sm bg-red-500 text-white rounded"
              >Delete</button>
            </div>
          </div>
        ))}
      </div>
      <h2 className="text-xl font-bold mt-12 mb-4">Incoming Booking Requests</h2>
      {bookingError && <p className="text-sm text-red-600 mb-2">{bookingError}</p>}
      <div className="space-y-3">
        {bookings.length === 0 && <p className="text-sm text-gray-500">No pending requests.</p>}
        {bookings.map(b => (
          <div key={b._id} className="bg-white shadow-card rounded-lg p-4 flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1">
              <p className="font-semibold text-sm">Booking #{b.bookingId}</p>
              <p className="text-xs text-gray-500">Service: {b.service?.name || '—'} {b.scheduledAt && (<span className="ml-2">• {new Date(b.scheduledAt).toLocaleString()}</span>)}</p>
              <p className="text-xs text-gray-500">Customer: {b.customer?.name || 'Hidden'} {b.customer && (
                <button
                  onClick={async () => {
                    try {
                      const { data } = await API.get(`/users/customer/${b.customer._id}`);
                      setCustomerDetail(data.user);
                    } catch(e) { alert('Failed to load customer'); }
                  }}
                  className="text-brand-primary underline ml-2"
                >details</button>
              )}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={async () => { try { await API.patch(`/bookings/${b._id}/accept`); loadBookings(); } catch(e){ alert(e?.response?.data?.message || 'Failed'); } }}
                className="px-3 py-1 rounded bg-green-600 text-white text-sm"
              >Accept</button>
              <button
                onClick={async () => { const reason = prompt('Reason (optional)'); try { await API.patch(`/bookings/${b._id}/reject`, { reason }); loadBookings(); } catch(e){ alert(e?.response?.data?.message || 'Failed'); } }}
                className="px-3 py-1 rounded bg-red-600 text-white text-sm"
              >Reject</button>
            </div>
          </div>
        ))}
      </div>
      {customerDetail && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={()=>setCustomerDetail(null)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow" onClick={e=>e.stopPropagation()}>
            <h3 className="font-semibold mb-2">Customer Info</h3>
            <p className="text-sm"><span className="font-medium">Name:</span> {customerDetail.name}</p>
            <p className="text-sm"><span className="font-medium">Phone:</span> {customerDetail.phone || '—'}</p>
            <p className="text-sm"><span className="font-medium">Address:</span> {customerDetail.address || '—'}</p>
            <div className="text-right mt-4">
              <button onClick={()=>setCustomerDetail(null)} className="px-4 py-2 bg-brand-primary text-white rounded">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
