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
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-brand-gray-200 dark:border-gray-800 shadow-sm transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center space-x-2 text-2xl font-bold text-brand-primary hover:text-blue-600 transition-colors duration-200"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">LH</span>
            </div>
            <span className="hidden sm:block">LocalHands</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              item.show && (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive(item.path)
                      ? "bg-brand-primary text-white shadow-glow"
                      : "text-brand-gray-600 hover:text-brand-primary hover:bg-brand-gray-50"
                  }`}
                >
                  <item.icon className="w-4 h-4 mr-2" />
                  {item.name}
                </Link>
              )
            ))}
          </div>

          {/* Desktop Auth Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {!user ? (
              <>
                <button
                  onClick={() => nav("/login")}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-brand-gray-700 hover:text-brand-primary transition-colors duration-200"
                >
                  Sign In
                </button>
                <button
                  onClick={() => nav("/register")}
                  className="inline-flex items-center px-6 py-2 bg-brand-primary text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-all duration-200 shadow-card hover:shadow-cardHover transform hover:-translate-y-0.5"
                >
                  Get Started
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                {/* 🔔 Notifications */}
                <NotificationsBell />

                {/* Theme Toggle */}
                {user?.role === 'provider' && mounted && (
                  <button
                    disabled={liveUpdating}
                    onClick={async ()=> {
                      try { setLiveUpdating(true); await setAvailability(!user.isAvailable); } finally { setLiveUpdating(false); }
                    }}
                    className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium border ${user?.isAvailable ? 'bg-green-500 hover:bg-green-600 text-white border-green-600 dark:border-green-500' : 'bg-amber-500/90 hover:bg-amber-500 text-white border-amber-600 dark:border-amber-500'} disabled:opacity-60 disabled:cursor-not-allowed transition-colors`}
                  >
                    {user?.isAvailable ? '⚡ Live' : 'Go Live'}
                  </button>
                )}
                {mounted && (
                  <button
                    onClick={()=> setTheme(theme === 'dark' ? 'light' : 'dark')}
                    className="inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium border border-transparent bg-brand-gray-100 dark:bg-gray-800 text-brand-gray-600 dark:text-gray-300 hover:bg-brand-gray-200 dark:hover:bg-gray-700 transition-colors"
                    aria-label="Toggle dark mode"
                  >
                    {theme === 'dark' ? '🌞' : '🌙'}
                  </button>
                )}

                <div className="text-sm text-right">
                  <div className="font-medium text-brand-gray-900">{user.name}</div>
                  <div className="text-brand-gray-500 capitalize">{user.role}</div>
                </div>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-error hover:bg-error/10 rounded-lg transition-all duration-200"
                >
                  <FiLogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-lg text-brand-gray-600 hover:text-brand-primary hover:bg-brand-gray-50 transition-colors duration-200"
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
          <div className="px-2 pt-2 pb-3 space-y-1 bg-white dark:bg-gray-900 border-t border-brand-gray-200 dark:border-gray-800 shadow-card transition-colors">
            {navItems.map((item) => (
              item.show && (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center px-3 py-3 rounded-lg text-base font-medium transition-all duration-200 ${
                    isActive(item.path)
                      ? "bg-brand-primary text-white"
                      : "text-brand-gray-600 hover:text-brand-primary hover:bg-brand-gray-50"
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
                  className="w-full flex items-center px-3 py-3 text-base font-medium text-brand-gray-600 hover:text-brand-primary hover:bg-brand-gray-50 rounded-lg transition-colors duration-200"
                >
                  Sign In
                </button>
                <button
                  onClick={() => { nav("/register"); setMobileMenuOpen(false); }}
                  className="w-full flex items-center justify-center px-3 py-3 bg-brand-primary text-white text-base font-medium rounded-lg hover:bg-blue-600 transition-all duration-200"
                >
                  Get Started
                </button>
              </div>
            ) : (
              <div className="pt-4 border-t border-brand-gray-200 dark:border-gray-800 space-y-4">
                <div className="space-y-3">
                  {/* 🔔 Notifications for mobile */}
                  <div className="px-3">
                    <NotificationsBell />
                  </div>
                  <div className="px-3">
                    {user?.role === 'provider' && mounted && (
                      <button
                        disabled={liveUpdating}
                        onClick={async ()=> { try { setLiveUpdating(true); await setAvailability(!user.isAvailable); } finally { setLiveUpdating(false); setMobileMenuOpen(false); } }}
                        className={`w-full flex items-center justify-center px-3 py-2 mb-2 rounded-lg text-sm font-medium border ${user?.isAvailable ? 'bg-green-500 hover:bg-green-600 text-white border-green-600 dark:border-green-500' : 'bg-amber-500/90 hover:bg-amber-500 text-white border-amber-600 dark:border-amber-500'} disabled:opacity-60 disabled:cursor-not-allowed transition-colors`}
                      >{user?.isAvailable ? '⚡ Live' : 'Go Live'}</button>
                    )}
                    {mounted && (
                      <button
                        onClick={()=> { setTheme(theme === 'dark' ? 'light':'dark'); setMobileMenuOpen(false); }}
                        className="w-full flex items-center justify-center px-3 py-2 mb-2 rounded-lg text-sm font-medium bg-brand-gray-100 dark:bg-gray-800 text-brand-gray-600 dark:text-gray-300 hover:bg-brand-gray-200 dark:hover:bg-gray-700 transition-colors"
                      >{theme === 'dark' ? '☀ Light Mode' : '🌙 Dark Mode'}</button>
                    )}
                  </div>
                </div>
                <div className="px-3 py-2">
                  <div className="text-base font-medium text-brand-gray-900">{user.name}</div>
                  <div className="text-sm text-brand-gray-500 capitalize">{user.role}</div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center px-3 py-3 text-base font-medium text-error hover:bg-error/10 rounded-lg transition-all duration-200"
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
