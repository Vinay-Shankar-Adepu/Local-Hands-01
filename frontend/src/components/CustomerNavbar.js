import React, { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  FiHome,
  FiUser,
  FiLogOut,
  FiMenu,
  FiX,
  FiClock,
  FiSun,
  FiMoon,
} from "react-icons/fi";
import NotificationsBell from "./NotificationsBell";
import { motion } from "framer-motion";

export default function CustomerNavbar() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => setMounted(true), []);
  const isActive = (path) => loc.pathname === path;

  const navItems = [
    { name: "Dashboard", path: "/customer", icon: FiHome },
    { name: "History", path: "/customer/history", icon: FiClock },
    { name: "Profile", path: "/profile", icon: FiUser },
  ];

  // Early render skeleton when auth still resolving
  if (!user) {
    return (
      <nav className="sticky top-0 z-50 bg-white/90 dark:bg-gray-900/95 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center h-16">
          <div className="text-gray-500 dark:text-gray-400 text-sm">Loading...</div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="sticky top-0 z-50 bg-white/90 dark:bg-gray-900/95 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700 shadow-sm dark:shadow-black/30 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 flex justify-between items-center h-16">
        {/* Logo */}
        <Link
          to="/customer"
          className="flex items-center space-x-2 text-xl font-bold text-blue-600 dark:text-blue-400 hover:scale-105 transition-transform duration-300"
        >
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 text-white flex items-center justify-center rounded-lg shadow-lg">
            LH
          </div>
          <span className="hidden sm:block">LocalHands</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-1">
          {navItems.map((item, idx) => (
            <motion.div
              key={item.path}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1, duration: 0.3 }}
            >
              <Link
                to={item.path}
                className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                  isActive(item.path)
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.name}
                {isActive(item.path) && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Right Section */}
        <div className="hidden md:flex items-center gap-3">
          <NotificationsBell />

          {/* Theme Toggle */}
          {mounted && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <FiSun className="w-5 h-5 text-yellow-500" />
              ) : (
                <FiMoon className="w-5 h-5 text-gray-700" />
              )}
            </motion.button>
          )}

          {/* User Info */}
          <div className="flex items-center gap-3 px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="text-sm text-right">
              <p className="font-semibold text-gray-900 dark:text-white">{user?.name || 'User'}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user?.role || 'customer'}</p>
            </div>
          </div>

          {/* Sign Out */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              logout();
              nav("/");
            }}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-300"
          >
            <FiLogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </motion.button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <FiX size={22} /> : <FiMenu size={22} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-lg"
        >
          <div className="px-4 py-3 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                  isActive(item.path)
                    ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </Link>
            ))}
            
            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                {theme === "dark" ? (
                  <>
                    <FiSun className="w-5 h-5" />
                    Light Mode
                  </>
                ) : (
                  <>
                    <FiMoon className="w-5 h-5" />
                    Dark Mode
                  </>
                )}
              </button>
            )}

            <button
              onClick={() => {
                logout();
                nav("/");
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              <FiLogOut className="w-5 h-5" />
              Sign Out
            </button>
          </div>
        </motion.div>
      )}
    </nav>
  );
}
