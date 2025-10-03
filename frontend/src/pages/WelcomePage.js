import React from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { FiSmile, FiZap, FiBriefcase, FiShoppingBag } from "react-icons/fi";

export default function WelcomePage() {
  const { user } = useAuth();

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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-brand-light via-white to-blue-50 text-center px-6">
      {/* Welcome Card */}
      <div className="bg-white shadow-2xl rounded-3xl p-10 max-w-lg w-full animate-fade-in">
        <div className="flex flex-col items-center space-y-6">
          {/* Icon */}
          <div className="w-20 h-20 bg-gradient-to-r from-brand-primary to-brand-secondary rounded-full flex items-center justify-center shadow-lg">
            <Icon className="text-white w-10 h-10" />
          </div>

          {/* Welcome Text */}
          <h1 className="text-4xl font-bold text-brand-gray-900">
            Welcome, <span className="text-brand-primary">{user.name}</span> 👋
          </h1>
          <p className="text-lg text-brand-gray-600">
            You are logged in as a{" "}
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
        </div>
      </div>

      {/* Footer */}
      <p className="mt-8 text-sm text-brand-gray-500">
        Powered by <span className="text-brand-primary font-medium">LocalHands</span>
      </p>
    </div>
  );
}
