import React, { useState, useEffect } from "react";
import { useTheme } from 'next-themes';
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { 
  FiHome, 
  FiUser, 
  FiLogOut, 
  FiMenu, 
  FiX,
  FiBriefcase,
  FiShoppingBag,
  FiSettings
} from "react-icons/fi";
import NotificationsBell from "./NotificationsBell"; // 🔔 import bell

export default function Navbar() {
  const { user, logout, setAvailability } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [liveUpdating, setLiveUpdating] = useState(false);
  useEffect(()=> setMounted(true),[]);

  const isActive = (path) => loc.pathname === path;

  const handleLogout = () => {
    logout();
    nav("/");
    setMobileMenuOpen(false);
  };

  const navItems = [
    { name: "Home", path: "/", icon: FiHome, show: !user },
    { name: "Dashboard", path: "/customer", icon: FiShoppingBag, show: user?.role === "customer" },
    { name: "Dashboard", path: "/provider", icon: FiBriefcase, show: user?.role === "provider" },
    { name: "Admin Panel", path: "/admin", icon: FiSettings, show: user?.role === "admin" },
    { name: "Profile", path: "/profile", icon: FiUser, show: !!user }
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/90 dark:bg-gray-900/95 backdrop-blur-xl border-b border-brand-gray-200 dark:border-gray-700/50 shadow-sm dark:shadow-lg dark:shadow-black/20 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center space-x-2 text-2xl font-bold text-brand-primary dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-500 transition-all duration-300 group"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-brand-primary to-blue-600 dark:from-blue-500 dark:to-blue-700 rounded-xl flex items-center justify-center shadow-md dark:shadow-glow-blue group-hover:scale-105 transition-transform duration-300">
              <span className="text-white text-base font-bold">LH</span>
            </div>
            <span className="hidden sm:block bg-clip-text dark:bg-gradient-to-r dark:from-blue-400 dark:to-blue-600">LocalHands</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              item.show && (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    isActive(item.path)
                      ? "bg-brand-primary dark:bg-blue-500 text-white shadow-glow dark:shadow-glow-blue"
                      : "text-brand-gray-600 dark:text-gray-300 hover:text-brand-primary dark:hover:text-blue-400 hover:bg-brand-gray-50 dark:hover:bg-gray-800"
                  }`}
                >
                  <item.icon className="w-4 h-4 mr-2" />
                  {item.name}
                </Link>
              )
            ))}
          </div>

          {/* Desktop Auth Actions */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Prominent Theme Switcher - Always visible */}
            {mounted && (
              <button
                onClick={()=> setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="group relative inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-brand-gray-100 to-brand-gray-200 dark:from-gray-800 dark:to-gray-700 text-brand-gray-700 dark:text-gray-200 hover:from-brand-gray-200 hover:to-brand-gray-300 dark:hover:from-gray-700 dark:hover:to-gray-600 border border-brand-gray-300 dark:border-gray-600 shadow-sm dark:shadow-glow-blue hover:shadow-md dark:hover:shadow-dark-glow transition-all duration-300 hover:scale-105"
                aria-label="Toggle dark mode"
              >
                <span className="text-lg transition-transform duration-300 group-hover:rotate-180">
                  {theme === 'dark' ? '☀️' : '🌙'}
                </span>
                <span className="hidden lg:block">{theme === 'dark' ? 'Light' : 'Dark'}</span>
              </button>
            )}

            {!user ? (
              <>
                <button
                  onClick={() => nav("/login")}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-brand-gray-700 dark:text-gray-300 hover:text-brand-primary dark:hover:text-blue-400 transition-colors duration-300"
                >
                  Sign In
                </button>
                <button
                  onClick={() => nav("/register")}
                  className="inline-flex items-center px-6 py-2 bg-gradient-to-r from-brand-primary to-blue-600 dark:from-blue-500 dark:to-blue-700 text-white text-sm font-semibold rounded-xl hover:from-blue-600 hover:to-blue-700 dark:hover:from-blue-600 dark:hover:to-blue-800 transition-all duration-300 shadow-md dark:shadow-glow-blue hover:shadow-lg dark:hover:shadow-dark-glow transform hover:-translate-y-0.5 hover:scale-105"
                >
                  Get Started
                </button>
              </>
            ) : (
              <>
                {/* 🔔 Notifications */}
                <NotificationsBell />

                {/* Provider Go Live Button */}
                {user?.role === 'provider' && mounted && (
                  <button
                    disabled={liveUpdating}
                    onClick={async ()=> {
                      try { setLiveUpdating(true); await setAvailability(!user.isAvailable); } finally { setLiveUpdating(false); }
                    }}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold border shadow-sm transition-all duration-300 hover:scale-105 ${
                      user?.isAvailable 
                        ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white border-green-600 dark:border-green-500 shadow-green-500/20 dark:shadow-green-500/40' 
                        : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white border-amber-600 dark:border-amber-500 shadow-amber-500/20 dark:shadow-amber-500/40'
                    } disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100`}
                  >
                    {user?.isAvailable ? '⚡ Live' : '🔴 Go Live'}
                  </button>
                )}

                {/* User Info */}
                <div className="hidden lg:block text-sm text-right px-3 py-2 rounded-lg bg-brand-gray-50 dark:bg-gray-800/50 border border-transparent dark:border-gray-700">
                  <div className="font-semibold text-brand-gray-900 dark:text-white">{user.name}</div>
                  <div className="text-xs text-brand-gray-500 dark:text-gray-400 capitalize">{user.role}</div>
                </div>

                {/* Sign Out */}
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-error dark:text-red-400 hover:bg-error/10 dark:hover:bg-red-500/20 border border-transparent hover:border-error/20 dark:hover:border-red-500/30 rounded-xl transition-all duration-300 hover:scale-105"
                >
                  <FiLogOut className="w-4 h-4" />
                  <span className="hidden lg:block">Sign Out</span>
                </button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            {/* Mobile Theme Switcher */}
            {mounted && (
              <button
                onClick={()=> setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="inline-flex items-center justify-center p-2 rounded-lg bg-brand-gray-100 dark:bg-gray-800 text-brand-gray-600 dark:text-gray-300 hover:bg-brand-gray-200 dark:hover:bg-gray-700 border border-brand-gray-300 dark:border-gray-600 transition-all duration-300"
                aria-label="Toggle dark mode"
              >
                <span className="text-lg">{theme === 'dark' ? '☀️' : '🌙'}</span>
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-lg text-brand-gray-600 dark:text-gray-300 hover:text-brand-primary dark:hover:text-blue-400 hover:bg-brand-gray-50 dark:hover:bg-gray-800 border border-transparent hover:border-brand-gray-300 dark:hover:border-gray-600 transition-all duration-300"
            >
              {mobileMenuOpen ? (
                <FiX className="block h-6 w-6" />
              ) : (
                <FiMenu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden animate-slide-up">
          <div className="px-2 pt-2 pb-3 space-y-1 bg-white/95 dark:bg-gray-900/98 backdrop-blur-xl border-t border-brand-gray-200 dark:border-gray-700/50 shadow-lg dark:shadow-2xl dark:shadow-black/40 transition-all duration-300">
            {navItems.map((item) => (
              item.show && (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center px-3 py-3 rounded-lg text-base font-medium transition-all duration-300 ${
                    isActive(item.path)
                      ? "bg-brand-primary dark:bg-blue-500 text-white dark:shadow-glow-blue"
                      : "text-brand-gray-600 dark:text-gray-300 hover:text-brand-primary dark:hover:text-blue-400 hover:bg-brand-gray-50 dark:hover:bg-gray-800"
                  }`}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              )
            ))}
            
            {!user ? (
              <div className="pt-4 space-y-2">
                <button
                  onClick={() => { nav("/login"); setMobileMenuOpen(false); }}
                  className="w-full flex items-center px-3 py-3 text-base font-medium text-brand-gray-600 dark:text-gray-300 hover:text-brand-primary dark:hover:text-blue-400 hover:bg-brand-gray-50 dark:hover:bg-gray-800 rounded-lg transition-all duration-300"
                >
                  Sign In
                </button>
                <button
                  onClick={() => { nav("/register"); setMobileMenuOpen(false); }}
                  className="w-full flex items-center justify-center px-3 py-3 bg-brand-primary dark:bg-blue-500 text-white text-base font-medium rounded-lg hover:bg-blue-600 dark:hover:bg-blue-600 transition-all duration-300 dark:shadow-glow-blue"
                >
                  Get Started
                </button>
              </div>
            ) : (
              <div className="pt-4 border-t border-brand-gray-200 dark:border-gray-700/50 space-y-4">
                <div className="space-y-3">
                  {/* 🔔 Notifications for mobile */}
                  <div className="px-3">
                    <NotificationsBell />
                  </div>
                  {user?.role === 'provider' && mounted && (
                    <div className="px-3">
                      <button
                        disabled={liveUpdating}
                        onClick={async ()=> { try { setLiveUpdating(true); await setAvailability(!user.isAvailable); } finally { setLiveUpdating(false); setMobileMenuOpen(false); } }}
                        className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold border shadow-sm transition-all duration-300 ${
                          user?.isAvailable 
                            ? 'bg-gradient-to-r from-green-500 to-green-600 text-white border-green-600 dark:border-green-500' 
                            : 'bg-gradient-to-r from-amber-500 to-amber-600 text-white border-amber-600 dark:border-amber-500'
                        } disabled:opacity-60 disabled:cursor-not-allowed`}
                      >{user?.isAvailable ? '⚡ Live' : '🔴 Go Live'}</button>
                    </div>
                  )}
                </div>
                <div className="px-3 py-3 mx-3 rounded-xl bg-brand-gray-50 dark:bg-gray-800/70 border border-brand-gray-200 dark:border-gray-700">
                  <div className="text-base font-semibold text-brand-gray-900 dark:text-white">{user.name}</div>
                  <div className="text-sm text-brand-gray-500 dark:text-gray-400 capitalize">{user.role}</div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center px-3 py-3 text-base font-medium text-error dark:text-red-400 hover:bg-error/10 dark:hover:bg-red-500/20 rounded-lg transition-all duration-300"
                >
                  <FiLogOut className="w-5 h-5 mr-3" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
