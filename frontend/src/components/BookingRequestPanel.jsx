import React, { useState, useEffect } from 'react';
import { BookingAPI } from '../services/api';

// Lightweight panel to demonstrate multi-provider request with sort modes.
export default function BookingRequestPanel({ templateId, customerLocation }) {
  const [sortMode, setSortMode] = useState('balanced');
  const [radiusKm, setRadiusKm] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [countdown, setCountdown] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);
  useEffect(()=>{
    if(countdown == null) return;
    if(countdown <= 0) return;
    const t = setTimeout(()=> setCountdown(c=> c-1), 1000);
    return ()=> clearTimeout(t);
  },[countdown]);

  const submit = async() => {
    if(!templateId){
      alert('No service template selected');
      return;
    }
    setLoading(true); setError(null); setResult(null);
    try {
      const payload = {
        templateId,
        lng: customerLocation?.lng ?? 0,
        lat: customerLocation?.lat ?? 0,
        sortMode,
      };
      if(radiusKm) payload.radiusKm = Number(radiusKm);
      const { data } = await BookingAPI.createMulti(payload);
      setResult({ booking: data.booking, ranked: data.rankedProviders });
      setCountdown(10); // 10 second provider response window
    } catch(e){
      setError(e?.response?.data?.message || e.message);
    } finally { setLoading(false); }
  };

  const cancelBooking = async () => {
    if(!result?.booking?._id) return;
    if(!window.confirm('Cancel this booking?')) return;
    try {
      setCancelling(true);
      const { data } = await BookingAPI.cancel(result.booking._id, cancelReason);
      setResult(r => ({ ...r, booking: data.booking }));
      setCountdown(null);
    } catch(e){
      alert(e?.response?.data?.message || e.message);
    } finally { setCancelling(false); }
  };

  return (
    <div className="p-4 border rounded-lg bg-white shadow-sm space-y-3">
      <h3 className="font-semibold text-gray-800">Request a Service (Multi-Provider)</h3>
      <div className="flex flex-wrap gap-2">
        {['highest_rating','nearest','balanced'].map(mode => (
          <button
            key={mode}
            onClick={()=>setSortMode(mode)}
            className={`px-3 py-1.5 text-sm rounded-full border transition ${sortMode===mode ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 hover:bg-gray-100'}`}
          >{mode.replace('_',' ')}</button>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <label className="text-sm text-gray-600">Radius (km)</label>
        <input value={radiusKm} onChange={e=>setRadiusKm(e.target.value)} placeholder="optional" className="w-24 px-2 py-1 border rounded" />
      </div>
      <button disabled={loading} onClick={submit} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
        {loading? 'Sending...' : 'Send Request'}
      </button>
      {error && <div className="text-sm text-red-600">{error}</div>}
      {result && (
        <div className="text-xs text-gray-700 border-t pt-2 space-y-1">
          <div>Booking ID: {result.booking.bookingId}</div>
          <div>Offers Started: {result.booking.offers?.length}</div>
          {typeof countdown === 'number' && countdown > 0 && (
            <div className="text-blue-600 font-medium">Awaiting provider response ({countdown}s)...</div>
          )}
          {result.ranked && (
            <div className="mt-1">
              <div className="font-semibold mb-1">Ranked Preview (debug)</div>
              <ol className="list-decimal ml-4 space-y-0.5">
                {result.ranked.slice(0,5).map(r => (
                  <li key={r.providerId} className="flex gap-2">
                    <span>ID: {r.providerId}</span>
                    {r.distanceKm != null && <span>• {r.distanceKm} km</span>}
                    <span>• rating {r.rating}</span>
                    {r.balancedScore !== undefined && <span>• score {r.balancedScore}</span>}
                  </li>
                ))}
              </ol>
            </div>
          )}
          {['requested','accepted','in_progress'].includes(result.booking.status) && result.booking.status !== 'cancelled' && (
            <div className="mt-3 space-y-2 border-t pt-2">
              <textarea
                value={cancelReason}
                onChange={e=>setCancelReason(e.target.value)}
                placeholder={result.booking.status === 'requested' ? 'Optional reason (optional before acceptance)' : 'Reason required to cancel after acceptance'}
                className="w-full text-xs p-2 border rounded"
                rows={2}
              />
              <button
                onClick={cancelBooking}
                disabled={cancelling || (['accepted','in_progress'].includes(result.booking.status) && cancelReason.trim().length===0)}
                className="px-3 py-1.5 text-xs rounded bg-red-600 text-white disabled:opacity-50"
              >{cancelling? 'Cancelling...' : 'Cancel Booking'}</button>
            </div>
          )}
        </div>
      )}
      <p className="text-xs text-gray-500">Balanced formula currently uses normalized distance and inverse rating on backend; switchable if literal weighting needed.</p>
    </div>
  );
}
