import React, { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { FiSmile, FiZap, FiBriefcase, FiShoppingBag } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

export default function WelcomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showToast, setShowToast] = React.useState(true);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <p className="text-gray-600 text-lg">You are not logged in.</p>
      </div>
    );
  }

  const roleIcons = {
    customer: FiShoppingBag,
    provider: FiBriefcase,
    admin: FiZap,
  };
  const Icon = roleIcons[user.role] || FiSmile;

  // ✅ Function to skip/continue to role dashboard
  const handleContinue = () => {
    if (user.role === "customer") navigate("/customer");
    else if (user.role === "provider") navigate("/provider");
    else if (user.role === "admin") navigate("/admin");
    else navigate("/");
  };

  // ✅ Auto-hide toast after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowToast(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-brand-light via-white to-blue-50 text-center px-6 relative overflow-hidden">
      {/* ✅ Animated Toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="fixed top-5 right-5 bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg rounded-2xl px-6 py-3 flex items-center space-x-3 z-50"
          >
            <FiSmile className="text-white text-xl" />
            <span className="font-medium text-sm sm:text-base">
              Welcome back, <span className="font-semibold">{user.name}</span> 👋
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ✅ Welcome Card */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="bg-white shadow-2xl rounded-3xl p-10 max-w-lg w-full"
      >
        <div className="flex flex-col items-center space-y-6">
          {/* Icon */}
          <div className="w-20 h-20 bg-gradient-to-r from-brand-primary to-brand-secondary rounded-full flex items-center justify-center shadow-lg">
            <Icon className="text-white w-10 h-10" />
          </div>

          {/* Welcome Text */}
          <h1 className="text-4xl font-bold text-brand-gray-900">
            Welcome,{" "}
            <span className="text-brand-primary capitalize">{user.name}</span> 👋
          </h1>
          <p className="text-lg text-brand-gray-600">
            You are logged in as{" "}
            <span className="capitalize font-medium text-brand-secondary">
              {user.role}
            </span>
            .
          </p>

          {/* Quick Actions */}
          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center mt-6">
            {user.role === "customer" && (
              <Link
                to="/customer"
                className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-brand-primary text-white font-semibold rounded-xl shadow-md hover:bg-blue-600 transition-all duration-200"
              >
                Go to Dashboard
              </Link>
            )}
            {user.role === "provider" && (
              <Link
                to="/provider"
                className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-brand-primary text-white font-semibold rounded-xl shadow-md hover:bg-blue-600 transition-all duration-200"
              >
                Manage Services
              </Link>
            )}
            {user.role === "admin" && (
              <Link
                to="/admin"
                className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-brand-primary text-white font-semibold rounded-xl shadow-md hover:bg-blue-600 transition-all duration-200"
              >
                Admin Panel
              </Link>
            )}
          </div>

          {/* Continue / Skip Button */}
          <button
            onClick={handleContinue}
            className="mt-6 px-6 py-2 text-brand-primary font-medium rounded-full border border-brand-primary hover:bg-brand-primary hover:text-white transition-all duration-200"
          >
            Continue →
          </button>
        </div>
      </motion.div>

      {/* Footer */}
      <p className="mt-8 text-sm text-brand-gray-500">
        Powered by{" "}
        <span className="text-brand-primary font-medium">LocalHands</span>
      </p>
    </div>
  );
}
