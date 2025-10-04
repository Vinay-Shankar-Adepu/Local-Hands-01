import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleGuard from "./components/RoleGuard";
import LogoReveal from "./components/LogoReveal";

// Pages
import HomePage from "./pages/HomePage";
import CustomerHome from "./pages/CustomerHome";
import ProviderHome from "./pages/ProviderHome";
import ProfilePage from "./pages/ProfilePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import RoleSelectPage from "./pages/RoleSelectPage";
import CustomerDashboard from "./pages/CustomerDashboard";
import ProviderDashboard from "./pages/ProviderDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import WelcomePage from "./pages/WelcomePage";

// ✅ New pages
import CustomerHistory from "./pages/CustomerHistory";
import ProviderHistory from "./pages/ProviderHistory";

export default function App() {
  const { user, loading } = useAuth();
  const [logoDone, setLogoDone] = useState(false);

  if (loading) {
    // Centered Tailwind loader while auth is initializing
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900">
      {!logoDone && <LogoReveal onComplete={() => setLogoDone(true)} />}
      {logoDone && <Navbar />}
      {logoDone && (
        <main className="flex-1">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Role Selection → Always redirect to WelcomePage */}
            <Route
              path="/choose-role"
              element={
                <ProtectedRoute>
                  {user?.role ? <Navigate to="/welcome" replace /> : <RoleSelectPage />}
                </ProtectedRoute>
              }
            />

            {/* Welcome Page */}
            <Route
              path="/welcome"
              element={
                <ProtectedRoute>
                  <WelcomePage />
                </ProtectedRoute>
              }
            />

            {/* Customer Dashboard */}
            <Route
              path="/customer"
              element={
                <ProtectedRoute>
                  <RoleGuard allow={["customer"]}>
                    <CustomerHome />
                  </RoleGuard>
                </ProtectedRoute>
              }
            />

            {/* Customer History */}
            <Route
              path="/customer/history"
              element={
                <ProtectedRoute>
                  <RoleGuard allow={["customer"]}>
                    <CustomerHistory />
                  </RoleGuard>
                </ProtectedRoute>
              }
            />

            {/* Provider Dashboard */}
            <Route
              path="/provider"
              element={
                <ProtectedRoute>
                  <RoleGuard allow={["provider"]}>
                    <ProviderHome />
                  </RoleGuard>
                </ProtectedRoute>
              }
            />

            {/* Provider History */}
            <Route
              path="/provider/history"
              element={
                <ProtectedRoute>
                  <RoleGuard allow={["provider"]}>
                    <ProviderHistory />
                  </RoleGuard>
                </ProtectedRoute>
              }
            />

            {/* Profile */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />

            {/* Admin Dashboard */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <RoleGuard allow={["admin"]}>
                    <AdminDashboard />
                  </RoleGuard>
                </ProtectedRoute>
              }
            />

            {/* Catch-all → Redirect Home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      )}
    </div>
  );
}
