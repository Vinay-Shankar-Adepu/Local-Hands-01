import React, { useState, useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  FiBriefcase,
  FiUser,
  FiClock,
  FiSettings,
  FiLogOut,
  FiSun,
  FiMoon,
  FiChevronDown,
  FiMenu,
  FiX,
} from "react-icons/fi";
import API from "../services/api";

export default function ProviderNavbar() {
  const { user, logout, setAvailability } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [jobCount, setJobCount] = useState(0);
  const dropdownRef = useRef(null);

  useEffect(() => setMounted(true), []);
  const isActive = (path) => loc.pathname === path;

  // ✅ Fetch new job count every 15s
  useEffect(() => {
    if (!user) return;
    const fetchCount = async () => {
      try {
        const { data } = await API.get("/bookings/pending-count");
        setJobCount(data.count || 0);
      } catch {
        setJobCount(0);
      }
    };
    fetchCount();
    const interval = setInterval(fetchCount, 15000);
    return () => clearInterval(interval);
  }, [user]);

  const toggleLive = async () => {
    try {
      setUpdating(true);
      await setAvailability(!user.isAvailable);
    } finally {
      setUpdating(false);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <nav className="sticky top-0 z-50 bg-white/90 dark:bg-gray-900/95 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 flex justify-between items-center h-16">
        {/* Logo */}
        <Link
          to="/provider"
          className="flex items-center space-x-2 text-xl font-bold text-blue-600 dark:text-blue-400"
        >
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 text-white flex items-center justify-center rounded-lg shadow">
            LH
          </div>
          <span className="hidden sm:block">LocalHands</span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center space-x-3">
          <Link
            to="/provider"
            className={`relative px-4 py-2 rounded-md text-sm font-medium ${
              isActive("/provider")
                ? "bg-blue-600 text-white"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            <FiBriefcase className="inline mr-2" /> Jobs
            {jobCount > 0 && (
              <span className="absolute top-0 right-1 translate-x-2 -translate-y-1 bg-blue-600 text-white text-xs font-bold rounded-full px-1.5 py-0.5 shadow-sm">
                {jobCount}
              </span>
            )}
          </Link>

          <Link
            to="/provider/history"
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              isActive("/provider/history")
                ? "bg-blue-600 text-white"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            <FiClock className="inline mr-2" /> History
          </Link>
        </div>

        {/* Right Section */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={toggleLive}
            disabled={updating}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
              user?.isAvailable
                ? "bg-green-600 text-white hover:bg-green-700"
                : "bg-red-500 text-white hover:bg-red-600"
            }`}
          >
            {updating
              ? "Updating..."
              : user?.isAvailable
              ? "⚡ Live"
              : "🔴 Go Live"}
          </button>

          {/* Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-md"
            >
              {user.name}
              <FiChevronDown
                className={`w-4 h-4 transition-transform ${
                  dropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow border dark:border-gray-700 overflow-hidden">
                <Link
                  to="/profile"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <FiUser className="mr-3" /> Profile
                </Link>
                <Link
                  to="/change-password"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <FiSettings className="mr-3" /> Change Password
                </Link>

                {mounted && (
                  <button
                    onClick={() =>
                      setTheme(theme === "dark" ? "light" : "dark")
                    }
                    className="flex items-center w-full px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    {theme === "dark" ? (
                      <>
                        <FiSun className="mr-3" /> Light Mode
                      </>
                    ) : (
                      <>
                        <FiMoon className="mr-3" /> Dark Mode
                      </>
                    )}
                  </button>
                )}

                <button
                  onClick={() => {
                    logout();
                    nav("/");
                  }}
                  className="flex items-center w-full px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/40"
                >
                  <FiLogOut className="mr-3" /> Sign Out
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Button */}
        <button
          className="md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <FiX size={22} /> : <FiMenu size={22} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
          <Link
            to="/provider"
            className="relative block px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <FiBriefcase className="inline mr-2" /> Jobs
            {jobCount > 0 && (
              <span className="absolute right-6 top-2 bg-blue-600 text-white text-xs font-bold rounded-full px-1.5 py-0.5">
                {jobCount}
              </span>
            )}
          </Link>
          <Link
            to="/provider/history"
            className="block px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <FiClock className="inline mr-2" /> History
          </Link>
          <Link
            to="/profile"
            className="block px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <FiUser className="inline mr-2" /> Profile
          </Link>
          <button
            onClick={() => {
              logout();
              nav("/");
            }}
            className="block w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30"
          >
            <FiLogOut className="inline mr-2" /> Sign Out
          </button>
        </div>
      )}
    </nav>
  );
}
