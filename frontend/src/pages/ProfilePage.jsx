import React, { useEffect, useRef, useState } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FiUser, FiMail, FiPhone, FiMapPin, FiStar } from 'react-icons/fi';

export default function ProfilePage() {
  const { user, saveSession } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '', address: user?.address || '' });
  const [loading, setLoading] = useState(!user); // if user already in context we can render immediately
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  // fetch fresh profile (in case context is stale / missing fields)
  useEffect(() => {
    let cancelled = false;
    const ran = fetchGuard.current;
    if (ran) return; // prevent duplicate in React strict mode
    fetchGuard.current = true;
    const load = async () => {
      try {
        console.log('[Profile] API base URL:', API.defaults.baseURL);
        const r = await API.get('/users/me');
        if (cancelled) return; const u = r.data.user || {};
        setForm({ name: u.name || '', phone: u.phone || '', address: u.address || '' });
      } catch (e) {
        if (cancelled) return;
        const status = e?.response?.status;
        if (status === 404) {
          console.warn('[Profile] /users/me returned 404, falling back to /auth/me (backend may not have userRoutes loaded yet).');
          try {
            const r2 = await API.get('/auth/me');
            const u2 = r2.data.user || {};
            setForm({ name: u2.name || '', phone: u2.phone || '', address: u2.address || '' });
            setError('Limited profile loaded (backend missing /users route). Restart backend to enable full editing.');
          } catch (inner) {
            console.error('[Profile] fallback /auth/me failed', inner);
            setError(inner?.response?.data?.message || 'Failed to load profile');
          }
        } else {
          setError(e?.response?.data?.message || 'Failed to load profile');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const fetchGuard = useRef(false);

  const submit = async e => {
    e.preventDefault(); setSaving(true); setMsg(''); setError('');
    try {
      const { data } = await API.patch('/users/me', form);
      setMsg('Profile updated');
      // refresh auth context copy
      saveSession(null, { ...user, ...data.user });
    } catch(e){ setError(e?.response?.data?.message || 'Save failed'); } finally { setSaving(false); }
  };

  if (loading) return <div className='p-6 text-sm text-gray-500 animate-pulse'>Loading profile...</div>;

  return (
    <div className='max-w-2xl mx-auto p-6'>
      <div className='bg-white/5 backdrop-blur rounded-lg border border-white/10 shadow-md p-6'>
        <div className='flex items-center justify-between mb-4'>
          <h1 className='text-2xl font-bold tracking-tight'>My Profile</h1>
          <span className='text-[10px] uppercase tracking-wider bg-brand-primary/10 text-brand-primary px-2 py-1 rounded'>v1</span>
        </div>
        {(user?.ratingCount>0) && (
          <div className='mb-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-600 text-sm'>
            <FiStar className='w-4 h-4 fill-current' />
            <span>{user.rating?.toFixed?.(1)} / 5</span>
            <span className='text-xs text-gray-500'>( {user.ratingCount} rating{user.ratingCount!==1?'s':''} )</span>
          </div>
        )}
        {(msg || error) && (
          <div className={`mb-4 text-sm rounded px-3 py-2 ${error ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>{error || msg}</div>
        )}
        <form onSubmit={submit} className='space-y-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div className='col-span-1 md:col-span-2'>
              <label className='block text-xs font-semibold uppercase tracking-wide text-gray-400'>Full Name</label>
              <input className='mt-1 w-full rounded-md bg-white/5 border border-white/10 focus:border-brand-primary/60 focus:ring-1 focus:ring-brand-primary/40 px-3 py-2 outline-none transition' value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required />
            </div>
            <div>
              <label className='block text-xs font-semibold uppercase tracking-wide text-gray-400'>Phone {user?.googleId && <span className='normal-case lowercase text-[10px] text-gray-500'>(optional)</span>}</label>
              <input className='mt-1 w-full rounded-md bg-white/5 border border-white/10 focus:border-brand-primary/60 focus:ring-1 focus:ring-brand-primary/40 px-3 py-2 outline-none transition' value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} placeholder='+1 555-1234' />
            </div>
            <div>
              <label className='block text-xs font-semibold uppercase tracking-wide text-gray-400'>Email</label>
              <input disabled className='mt-1 w-full rounded-md bg-white/5 border border-white/10 px-3 py-2 text-gray-400 cursor-not-allowed' value={user?.email || ''} />
            </div>
            <div className='md:col-span-2'>
              <label className='block text-xs font-semibold uppercase tracking-wide text-gray-400'>Address (Customers)</label>
              <textarea className='mt-1 w-full rounded-md bg-white/5 border border-white/10 focus:border-brand-primary/60 focus:ring-1 focus:ring-brand-primary/40 px-3 py-2 outline-none transition resize-none' rows={3} value={form.address} onChange={e=>setForm({...form,address:e.target.value})} placeholder='Street, City, ZIP' />
              {user?.role === 'provider' && <p className='mt-1 text-[11px] text-gray-500'>Providers can leave address blank (used mainly for customer bookings & receipts).</p>}
            </div>
          </div>
          <div className='flex items-center gap-3'>
            <button disabled={saving} className='inline-flex items-center gap-2 px-5 py-2 rounded-md bg-brand-primary text-white text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed shadow hover:shadow-md transition'>
              {saving && <span className='w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin'></span>}
              {saving?'Saving...':'Save Changes'}
            </button>
            <span className='text-[11px] text-gray-500'>Your data is kept private and never shared.</span>
          </div>
        </form>
      </div>
    </div>
  );
}
