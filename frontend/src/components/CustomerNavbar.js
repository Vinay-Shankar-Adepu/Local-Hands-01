import React, { useState, useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  FiHome,
  FiUser,
  FiLogOut,
  FiMenu,
  FiX,
  FiShoppingBag,
  FiClock,
  FiSettings,
  FiSun,
  FiMoon,
  FiChevronDown,
} from "react-icons/fi";
import NotificationsBell from "./NotificationsBell";

export default function CustomerNavbar() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const { theme, setTheme } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => setMounted(true), []);
  const isActive = (path) => loc.pathname === path;

  // Close dropdown outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setDropdownOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <nav className="sticky top-0 z-50 bg-white/90 dark:bg-gray-900/95 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700 shadow-sm dark:shadow-black/30">
      <div className="max-w-7xl mx-auto px-4 flex justify-between items-center h-16">
        {/* Logo */}
        <Link
          to="/customer"
          className="flex items-center space-x-2 text-xl font-bold text-blue-600 dark:text-blue-400"
        >
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 text-white flex items-center justify-center rounded-lg shadow">
            LH
          </div>
          <span className="hidden sm:block">LocalHands</span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center space-x-2">
          <Link
            to="/customer"
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              isActive("/customer")
                ? "bg-blue-600 text-white"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            <FiHome className="inline mr-2" /> Dashboard
          </Link>

          <Link
            to="/customer/history"
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              isActive("/customer/history")
                ? "bg-blue-600 text-white"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            <FiClock className="inline mr-2" /> History
          </Link>
        </div>

        {/* Right Section */}
        <div className="hidden md:flex items-center gap-3">
          <NotificationsBell />

          {/* Profile dropdown */}
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

        {/* Mobile Menu */}
        <button
          className="md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <FiX size={22} /> : <FiMenu size={22} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
          <Link
            to="/customer"
            className="block px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            Dashboard
          </Link>
          <Link
            to="/customer/history"
            className="block px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            History
          </Link>
          <Link
            to="/profile"
            className="block px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            Profile
          </Link>
          <button
            onClick={() => {
              logout();
              nav("/");
            }}
            className="block w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30"
          >
            Sign Out
          </button>
        </div>
      )}
    </nav>
  );
}
