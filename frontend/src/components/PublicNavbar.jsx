import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "next-themes";
import {
  FiHome,
  FiLogIn,
  FiUserPlus,
  FiMenu,
  FiX,
  FiSun,
  FiMoon,
} from "react-icons/fi";

export default function PublicNavbar() {
  const nav = useNavigate();
  const loc = useLocation();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => setMounted(true), []);

  const isActive = (path) => loc.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-white/90 dark:bg-gray-900/95 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700/50 shadow-sm dark:shadow-lg dark:shadow-black/20 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* ✅ Logo */}
          <Link
            to="/"
            className="flex items-center space-x-2 text-2xl font-bold text-brand-primary dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-500 transition-all duration-300 group"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-brand-primary to-blue-600 dark:from-blue-500 dark:to-blue-700 rounded-xl flex items-center justify-center shadow-md dark:shadow-glow-blue group-hover:scale-105 transition-transform duration-300">
              <span className="text-white text-base font-bold">LH</span>
            </div>
            <span className="hidden sm:block bg-clip-text dark:bg-gradient-to-r dark:from-blue-400 dark:to-blue-600">
              LocalHands
            </span>
          </Link>

          {/* ✅ Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              to="/"
              className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                isActive("/")
                  ? "bg-brand-primary dark:bg-blue-500 text-white shadow-glow dark:shadow-glow-blue"
                  : "text-brand-gray-600 dark:text-gray-300 hover:text-brand-primary dark:hover:text-blue-400 hover:bg-brand-gray-50 dark:hover:bg-gray-800"
              }`}
            >
              <FiHome className="w-4 h-4 mr-2" />
              Home
            </Link>

            <button
              onClick={() => nav("/login")}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-brand-gray-700 dark:text-gray-300 hover:text-brand-primary dark:hover:text-blue-400 transition-colors duration-300"
            >
              <FiLogIn className="w-4 h-4 mr-2" />
              Sign In
            </button>

            <button
              onClick={() => nav("/register")}
              className="inline-flex items-center px-6 py-2 bg-gradient-to-r from-brand-primary to-blue-600 dark:from-blue-500 dark:to-blue-700 text-white text-sm font-semibold rounded-xl hover:from-blue-600 hover:to-blue-700 dark:hover:from-blue-600 dark:hover:to-blue-800 transition-all duration-300 shadow-md dark:shadow-glow-blue hover:shadow-lg transform hover:-translate-y-0.5 hover:scale-105"
            >
              <FiUserPlus className="w-4 h-4 mr-2" />
              Get Started
            </button>

            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="inline-flex items-center justify-center p-2 rounded-lg bg-brand-gray-100 dark:bg-gray-800 text-brand-gray-600 dark:text-gray-300 hover:bg-brand-gray-200 dark:hover:bg-gray-700 border border-brand-gray-300 dark:border-gray-600 transition-all duration-300"
              >
                {theme === "dark" ? <FiSun /> : <FiMoon />}
              </button>
            )}
          </div>

          {/* ✅ Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="inline-flex items-center justify-center p-2 rounded-lg bg-brand-gray-100 dark:bg-gray-800 text-brand-gray-600 dark:text-gray-300 hover:bg-brand-gray-200 dark:hover:bg-gray-700 border border-brand-gray-300 dark:border-gray-600 transition-all duration-300"
              >
                {theme === "dark" ? "☀️" : "🌙"}
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-lg text-brand-gray-600 dark:text-gray-300 hover:text-brand-primary dark:hover:text-blue-400 hover:bg-brand-gray-50 dark:hover:bg-gray-800"
            >
              {mobileMenuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* ✅ Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden animate-slide-up">
          <div className="px-3 py-4 bg-white/95 dark:bg-gray-900/98 border-t border-gray-200 dark:border-gray-700 space-y-3">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center px-3 py-3 rounded-lg text-base font-medium transition-all duration-300 ${
                isActive("/")
                  ? "bg-brand-primary dark:bg-blue-500 text-white"
                  : "text-gray-600 dark:text-gray-300 hover:text-brand-primary dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
            >
              <FiHome className="w-5 h-5 mr-3" /> Home
            </Link>
            <button
              onClick={() => {
                nav("/login");
                setMobileMenuOpen(false);
              }}
              className="flex items-center px-3 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg w-full"
            >
              <FiLogIn className="mr-3" /> Sign In
            </button>
            <button
              onClick={() => {
                nav("/register");
                setMobileMenuOpen(false);
              }}
              className="flex items-center px-3 py-3 bg-gradient-to-r from-brand-primary to-blue-600 text-white rounded-lg w-full shadow-md hover:from-blue-600 hover:to-blue-700 dark:hover:from-blue-600 dark:hover:to-blue-800"
            >
              <FiUserPlus className="mr-3" /> Get Started
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
