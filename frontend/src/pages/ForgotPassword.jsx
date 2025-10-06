import React, { useState } from 'react';
import { PasswordResetAPI } from '../services/api.extras';

export default function ForgotPassword() {
  const [step, setStep] = useState(1); // 1: email, 2: otp, 3: reset
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleRequest = async (e) => {
    e.preventDefault(); setError(''); setMessage('');
    try { setLoading(true); await PasswordResetAPI.request(email); setMessage('If the email exists, an OTP was sent.'); setStep(2); }
    catch(e){ setError(e?.response?.data?.message || 'Request failed'); }
    finally { setLoading(false); }
  };
  const handleVerify = async (e) => {
    e.preventDefault(); setError(''); setMessage('');
    try { setLoading(true); await PasswordResetAPI.verify(email, otp); setMessage('OTP valid. You can set a new password.'); setStep(3); }
    catch(e){ setError(e?.response?.data?.message || 'Invalid OTP'); }
    finally { setLoading(false); }
  };
  const handleReset = async (e) => {
    e.preventDefault(); setError(''); setMessage('');
    try { setLoading(true); await PasswordResetAPI.reset(email, otp, newPassword); setMessage('Password reset successful. You can login now.'); setStep(4); }
    catch(e){ setError(e?.response?.data?.message || 'Reset failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl dark:shadow-dark-glow border border-gray-200 dark:border-gray-700 p-8 space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Forgot Password</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">Recover access using email OTP.</p>
        {message && <div className="text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 p-3 rounded-lg">{message}</div>}
        {error && <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 p-3 rounded-lg">{error}</div>}

        {step === 1 && (
          <form onSubmit={handleRequest} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Email</label>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500" />
            </div>
            <button disabled={loading} className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold disabled:opacity-50">{loading?'Sending...':'Send OTP'}</button>
          </form>
        )}
        {step === 2 && (
          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">OTP (6 digits)</label>
              <input value={otp} onChange={e=>setOtp(e.target.value)} required maxLength={6} className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 tracking-widest text-center font-mono text-lg focus:ring-2 focus:ring-blue-500" />
            </div>
            <button disabled={loading || otp.length!==6} className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold disabled:opacity-50">{loading?'Verifying...':'Verify OTP'}</button>
            <button type="button" onClick={handleRequest} className="w-full py-2 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">Resend OTP</button>
          </form>
        )}
        {step === 3 && (
          <form onSubmit={handleReset} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">New Password</label>
              <input type="password" value={newPassword} onChange={e=>setNewPassword(e.target.value)} required minLength={6} className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500" />
            </div>
            <button disabled={loading} className="w-full py-3 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold disabled:opacity-50">{loading?'Resetting...':'Reset Password'}</button>
          </form>
        )}
        {step === 4 && (
          <div className="space-y-4">
            <p className="text-sm text-gray-700 dark:text-gray-300">Your password has been updated successfully.</p>
            <a href="/login" className="block w-full text-center py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold">Go to Login</a>
          </div>
        )}
        <div className="pt-2 text-center">
          <a href="/login" className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">Back to login</a>
        </div>
      </div>
    </div>
  );
}
