import React, { useState } from 'react';
import { FiPhone, FiLoader, FiCheckCircle } from 'react-icons/fi';
import API from '../services/api';

export default function WhatsAppAuth({ onSuccess, isLogin = false }) {
  const [step, setStep] = useState('phone'); // 'phone' or 'otp'
  const [form, setForm] = useState({ phone: '', name: '', otp: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Step 1: Send OTP
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      // Validate phone number
      let phone = form.phone.trim();
      
      // Add +91 if not present and phone starts with 6-9
      if (!phone.startsWith('+')) {
        if (phone.match(/^[6-9]\d{9}$/)) {
          phone = '+91' + phone;
        } else {
          setError('Please enter a valid 10-digit Indian mobile number');
          setLoading(false);
          return;
        }
      }

      const payload = {
        phone: phone,
        isLogin: isLogin
      };

      // Add name for registration
      if (!isLogin) {
        if (!form.name || form.name.trim().length === 0) {
          setError('Please enter your name');
          setLoading(false);
          return;
        }
        payload.name = form.name.trim();
      }

      const { data } = await API.post('/auth/whatsapp/send-otp', payload);
      
      setMessage(data.message);
      setStep('otp');
      setForm({ ...form, phone: phone }); // Save formatted phone
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await API.post('/auth/whatsapp/verify-otp', {
        phone: form.phone,
        otp: form.otp
      });

      // Success - pass token and user data to parent
      onSuccess(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const { data } = await API.post('/auth/whatsapp/resend-otp', {
        phone: form.phone
      });
      setMessage(data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  // Go back to phone input
  const handleBack = () => {
    setStep('phone');
    setForm({ ...form, otp: '' });
    setError('');
    setMessage('');
  };

  return (
    <div className="space-y-4">
      {/* Success/Error Messages */}
      {message && (
        <div className="p-3 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/30 rounded-lg text-green-700 dark:text-green-400 text-sm flex items-center gap-2">
          <FiCheckCircle />
          {message}
        </div>
      )}
      
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-lg text-red-700 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Step 1: Phone Number Input */}
      {step === 'phone' && (
        <form onSubmit={handleSendOTP} className="space-y-4">
          {!isLogin && (
            <div>
              <label htmlFor="wa-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                id="wa-name"
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent transition-all duration-300"
                placeholder="Enter your full name"
                disabled={loading}
              />
            </div>
          )}

          <div>
            <label htmlFor="wa-phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              WhatsApp Number <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <div className="flex items-center px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                +91
              </div>
              <input
                id="wa-phone"
                type="tel"
                required
                pattern="[6-9][0-9]{9}"
                value={form.phone.replace('+91', '')}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent transition-all duration-300"
                placeholder="9876543210"
                disabled={loading}
              />
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Enter 10-digit mobile number (e.g., 9876543210)
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-green-600 dark:bg-green-500 text-white font-semibold rounded-lg hover:bg-green-700 dark:hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-sm flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <FiLoader className="animate-spin" />
                Sending OTP...
              </>
            ) : (
              <>
                <FiPhone />
                Send OTP via WhatsApp
              </>
            )}
          </button>
        </form>
      )}

      {/* Step 2: OTP Verification */}
      {step === 'otp' && (
        <form onSubmit={handleVerifyOTP} className="space-y-4">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full mb-3">
              <FiPhone className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              Verify Your Number
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              We sent a 6-digit code to<br />
              <span className="font-medium text-gray-900 dark:text-white">{form.phone}</span>
            </p>
          </div>

          <div>
            <label htmlFor="wa-otp" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 text-center">
              Enter OTP <span className="text-red-500">*</span>
            </label>
            <input
              id="wa-otp"
              type="text"
              required
              pattern="[0-9]{6}"
              maxLength="6"
              value={form.otp}
              onChange={(e) => setForm({ ...form, otp: e.target.value.replace(/\D/g, '') })}
              className="w-full px-4 py-3 text-center text-2xl font-bold tracking-widest border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent transition-all duration-300"
              placeholder="000000"
              disabled={loading}
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={loading || form.otp.length !== 6}
            className="w-full py-3 bg-green-600 dark:bg-green-500 text-white font-semibold rounded-lg hover:bg-green-700 dark:hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-sm flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <FiLoader className="animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <FiCheckCircle />
                Verify OTP
              </>
            )}
          </button>

          <div className="flex items-center justify-between text-sm">
            <button
              type="button"
              onClick={handleBack}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              disabled={loading}
            >
              ← Change Number
            </button>
            <button
              type="button"
              onClick={handleResendOTP}
              className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium transition-colors"
              disabled={loading}
            >
              Resend OTP
            </button>
          </div>

          <p className="text-xs text-center text-gray-500 dark:text-gray-400">
            OTP expires in 10 minutes
          </p>
        </form>
      )}
    </div>
  );
}
