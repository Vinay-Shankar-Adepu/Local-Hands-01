import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { FiLoader } from "react-icons/fi";
import WhatsAppAuth from "../components/WhatsAppAuth";

export default function RegisterPage() {
  const { register, loginWithGoogleIdToken, loginWithWhatsApp, redirectAfterAuth } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [authMethod, setAuthMethod] = useState('email'); // 'email' or 'whatsapp'
  const nav = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const u = await register(form);
      redirectAfterAuth(u, nav);
    } catch (e) {
      setErr(e?.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const onGoogleSuccess = async (response) => {
    try {
      const idToken = response?.credential;
      const u = await loginWithGoogleIdToken(idToken);
      redirectAfterAuth(u, nav);
    } catch {
      setErr("Google sign-up failed. Please try again.");
    }
  };

  const handleWhatsAppSuccess = (data) => {
    // ✅ Use AuthContext's WhatsApp login method to save session
    const result = loginWithWhatsApp(data);
    
    // ✅ Redirect based on needsRoleSelection flag
    if (result.needsRoleSelection) {
      nav("/welcome", { replace: true });
    } else {
      redirectAfterAuth(result.user, nav);
    }
  };

  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-[#0f172a] dark:via-[#1e293b] dark:to-[#0f172a] flex items-center justify-center p-4 transition-all duration-300">
        <div className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-2xl shadow-xl dark:shadow-dark-card p-6 sm:p-8 border border-gray-200 dark:border-gray-700 transition-all duration-300">
          {/* Branding */}
          <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-2">
            Join LocalHands
          </h1>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
            Create your account to book trusted services anytime
          </p>

          {/* Auth Method Toggle */}
          <div className="flex gap-2 mb-6 p-1 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <button
              type="button"
              onClick={() => setAuthMethod('email')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                authMethod === 'email'
                  ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              📧 Email
            </button>
            <button
              type="button"
              onClick={() => setAuthMethod('whatsapp')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                authMethod === 'whatsapp'
                  ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              💬 WhatsApp
            </button>
          </div>

          {/* Error Banner */}
          {err && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-lg text-red-700 dark:text-red-400 text-sm">
              {err}
            </div>
          )}

          {/* Email Registration Form */}
          {authMethod === 'email' && (
            <>
              <form onSubmit={onSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all duration-300"
                    placeholder="Full Name"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all duration-300"
                    placeholder="Email"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Phone
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all duration-300"
                    placeholder="Phone"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="password"
                    type="password"
                    required
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all duration-300"
                    placeholder="Password"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-brand-primary dark:bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-sm dark:shadow-glow-blue flex items-center justify-center"
                >
                  {loading ? (
                    <FiLoader className="w-5 h-5 animate-spin" />
                  ) : (
                    "Sign Up"
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">or</span>
                </div>
              </div>

              {/* Google Sign Up */}
              <div className="flex justify-center">
                <GoogleLogin
                  onSuccess={onGoogleSuccess}
                  onError={() => setErr("Google sign-up failed")}
                  theme="outline"
                  size="large"
                  width="100%"
                />
              </div>
            </>
          )}

          {/* WhatsApp Registration */}
          {authMethod === 'whatsapp' && (
            <WhatsAppAuth isLogin={false} onSuccess={handleWhatsAppSuccess} />
          )}

          {/* Footer */}
          <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-brand-primary dark:text-blue-400 hover:underline transition-colors duration-300"
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
}
