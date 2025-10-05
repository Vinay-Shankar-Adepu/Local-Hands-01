import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";
import { useAuth } from "../context/AuthContext";
import {
  FiSettings,
  FiLogOut,
  FiChevronDown,
  FiSun,
  FiMoon,
  FiHome,
  FiBarChart2,
  FiUsers,
} from "react-icons/fi";

export default function AdminNavbar() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const { theme, setTheme } = useTheme();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Close dropdown when clicked outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isActive = (path) => loc.pathname === path;

  const handleLogout = () => {
    logout();
    nav("/");
  };

  const navItems = [
    { name: "Dashboard", path: "/admin", icon: FiHome },
    { name: "Manage Providers", path: "/admin/providers", icon: FiUsers },
    { name: "Analytics", path: "/admin/analytics", icon: FiBarChart2 },
    { name: "Settings", path: "/admin/settings", icon: FiSettings },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/90 dark:bg-gray-900/95 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700 shadow-sm dark:shadow-lg transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            to="/admin"
            className="flex items-center space-x-2 text-2xl font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-500 transition-all duration-300 group"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-500 dark:from-blue-500 dark:to-blue-700 rounded-xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-300">
              <span className="text-white font-bold">LH</span>
            </div>
            <span className="hidden sm:block">Admin</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  isActive(item.path)
                    ? "bg-blue-600 text-white shadow-glow dark:shadow-glow-blue"
                    : "text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                <item.icon className="w-4 h-4 mr-2" />
                {item.name}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Theme toggle */}
            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? <FiSun /> : <FiMoon />}
              </button>
            )}

            {/* User dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-transparent dark:border-gray-700 text-sm font-medium text-gray-800 dark:text-gray-200 transition-all"
              >
                {user?.name || "Admin"}
                <FiChevronDown
                  className={`w-4 h-4 transition-transform ${
                    dropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden z-50">
                  <Link
                    to="/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <FiSettings className="mr-3" /> Profile Settings
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 border-t border-gray-200 dark:border-gray-700"
                  >
                    <FiLogOut className="mr-3" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden flex items-center gap-2">
            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300"
              >
                {theme === "dark" ? <FiSun /> : <FiMoon />}
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
