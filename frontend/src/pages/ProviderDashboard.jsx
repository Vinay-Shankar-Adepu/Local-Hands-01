import { useEffect, useState, useRef } from 'react';
import { useTheme } from 'next-themes';
import API from '../services/api';
import { FiClock, FiZap, FiCheck, FiX, FiBriefcase } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import ServiceSelectionModal from '../components/ServiceSelectionModal';

export default function ProviderDashboard() {
  const [offers, setOffers] = useState([]); // pending offers
  const [loadingOffers, setLoadingOffers] = useState(false);
  const [now, setNow] = useState(Date.now());
  const pollRef = useRef(null);
  const { theme, setTheme } = useTheme();
  const { user, setAvailability } = useAuth();
  const [liveUpdating, setLiveUpdating] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);

  const fetchOffers = async () => {
    try {
      setLoadingOffers(true);
      const { data } = await API.get('/bookings/offers/mine');
      setOffers(data.offers || []);
      setNow(Date.parse(data.now) || Date.now());
    } catch { /* ignore */ } finally { setLoadingOffers(false); }
  };

  useEffect(() => {
    fetchOffers();
    pollRef.current = setInterval(fetchOffers, 15000); // 15s polling
    const tick = setInterval(()=> setNow(Date.now()), 1000); // countdown second resolution
    return () => { clearInterval(pollRef.current); clearInterval(tick); };
  }, []);

  const secondsLeft = (timeoutAt) => {
    if(!timeoutAt) return null; const diff = Math.max(0, (new Date(timeoutAt).getTime() - now)/1000); return Math.floor(diff);
  };

  const respond = async (id, action) => {
    try {
      const url = `/bookings/${id}/offer/${action}`;
      await API.patch(url, {});
      fetchOffers();
    } catch(e){
      const data = e?.response?.data;
      alert(`Failed: ${data?.message || e.message}\n${data?.error ? 'Detail: '+data.error : ''}`);
      console.warn('[offer action error]', data); 
    }
  };

  return (
    <div className="min-h-screen max-w-7xl mx-auto px-6 py-10 space-y-10 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold mb-2">Provider Overview</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage live requests and performance</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowServiceModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/40 text-sm font-medium text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-800/60 transition-colors"
          >
            <FiBriefcase className="w-4 h-4" />
            Manage Services
          </button>
          <button
            onClick={()=> setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Toggle dark mode"
          >
            {theme === 'dark' ? '🌞 Light' : '🌙 Dark'}
          </button>
          {user?.role === 'provider' && (
            <button
              disabled={liveUpdating}
              onClick={async ()=> {
                try {
                  setLiveUpdating(true);
                  
                  // ✅ If turning ON Go Live, ask for current location first
                  if (!user.isAvailable) {
                    if (!navigator.geolocation) {
                      alert('Geolocation is not supported by your browser');
                      return;
                    }
                    
                    // Get current location
                    navigator.geolocation.getCurrentPosition(
                      async (position) => {
                        const location = {
                          lng: position.coords.longitude,
                          lat: position.coords.latitude
                        };
                        
                        try {
                          await setAvailability(true, location);
                          alert('You are now LIVE with updated location!');
                        } catch(e) {
                          alert(e?.response?.data?.message || 'Failed to go live');
                        } finally {
                          setLiveUpdating(false);
                        }
                      },
                      (error) => {
                        alert('Unable to get your location. Please enable location services.');
                        console.error('Geolocation error:', error);
                        setLiveUpdating(false);
                      },
                      { enableHighAccuracy: true, timeout: 10000 }
                    );
                  } else {
                    // Turning OFF - no location needed
                    await setAvailability(false);
                    setLiveUpdating(false);
                  }
                } catch(e){ 
                  alert(e?.response?.data?.message || 'Failed to update'); 
                  setLiveUpdating(false);
                }
              }}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors border ${user?.isAvailable ? 'bg-green-500 hover:bg-green-600 text-white border-green-600 dark:border-green-500' : 'bg-amber-500/90 hover:bg-amber-500 text-white border-amber-600 dark:border-amber-500'} disabled:opacity-60 disabled:cursor-not-allowed`}
            >
              {user?.isAvailable ? <><FiZap className="w-4 h-4"/> Live</> : <>Go Live <FiZap className="w-4 h-4"/></>}
            </button>
          )}
        </div>
      </div>

      <section className="grid md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl shadow-card bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-500 dark:text-gray-400">Active Offers</div>
          <div className="mt-2 text-3xl font-extrabold text-gray-900 dark:text-white">{offers.length}</div>
          <div className="text-gray-600 dark:text-gray-300">Awaiting response</div>
        </div>
        <div className="p-6 rounded-2xl shadow-card bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-500 dark:text-gray-400">Polling Every</div>
          <div className="mt-2 text-3xl font-extrabold text-gray-900 dark:text-white">15s</div>
          <div className="text-gray-600 dark:text-gray-300">Auto refresh</div>
        </div>
        <div className="p-6 rounded-2xl shadow-card bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-500 dark:text-gray-400">Assignment Mode</div>
          <div className="mt-2 text-3xl font-extrabold text-gray-900 dark:text-white">Queue</div>
          <div className="text-gray-600 dark:text-gray-300">Best-first offers</div>
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Pending Offers</h2>
          <button onClick={fetchOffers} className="text-sm px-3 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-800/60 border border-blue-100 dark:border-blue-800 transition-colors">Refresh</button>
        </div>
        {loadingOffers && <div className="text-sm text-gray-500 dark:text-gray-400">Loading offers...</div>}
        {!loadingOffers && offers.length === 0 && (
          <div className="text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">No pending offers. Stay live to receive new jobs.</div>
        )}
        <div className="space-y-4">
          {offers.map(o => {
            const secs = secondsLeft(o.timeoutAt);
            const pct = secs && o.timeoutAt ? Math.min(100, Math.max(0, (secs/120)*100)) : 0;
            return (
              <div key={o._id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-card">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-800 dark:text-gray-100">Booking {o.bookingId}</h3>
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <FiClock className="w-4 h-4" />
                    {secs != null ? `${secs}s left` : '—'}
                  </div>
                </div>
                <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden mb-4">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-500 transition-all" style={{ width: `${pct}%` }} />
                </div>
                <div className="flex gap-3">
                  <button onClick={()=>respond(o._id,'accept')} className="flex-1 inline-flex items-center justify-center gap-1 px-4 py-2 text-sm font-medium rounded-lg bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-500 text-white transition-colors"><FiCheck />Accept</button>
                  <button onClick={()=>respond(o._id,'decline')} className="flex-1 inline-flex items-center justify-center gap-1 px-4 py-2 text-sm font-medium rounded-lg bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-500 text-white transition-colors"><FiX />Decline</button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Service Selection Modal */}
      <ServiceSelectionModal
        isOpen={showServiceModal}
        onClose={() => setShowServiceModal(false)}
        onComplete={() => {
          setShowServiceModal(false);
          // Optionally refresh something
        }}
      />
    </div>
  );
}