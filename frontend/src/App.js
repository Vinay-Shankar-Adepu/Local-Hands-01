import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleGuard from "./components/RoleGuard";
import LogoReveal from "./components/LogoReveal";
import { AnimatePresence, motion } from "framer-motion";

// 🧭 Navbars
import PublicNavbar from "./components/PublicNavbar";
import CustomerNavbar from "./components/CustomerNavbar";
import ProviderNavbar from "./components/ProviderNavbar";
import AdminNavbar from "./components/AdminNavbar";

// 🧾 Pages
import HomePage from "./pages/HomePage";
import CustomerHome from "./pages/CustomerHome";
import ProviderHome from "./pages/ProviderHome";
import ProfilePage from "./pages/ProfilePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import RoleSelectPage from "./pages/RoleSelectPage";
import CustomerHistory from "./pages/CustomerHistory";
import ProviderHistory from "./pages/ProviderHistory";
import AdminDashboard from "./pages/AdminDashboard";
import WelcomePage from "./pages/WelcomePage";

export default function App() {
  const { user, loading } = useAuth();
  const [logoDone, setLogoDone] = useState(false);
  const [navbarKey, setNavbarKey] = useState("public");

  // Update navbar when user role changes
  useEffect(() => {
    if (user?.role) setNavbarKey(user.role);
    else setNavbarKey("public");
  }, [user]);

  // ✅ Show a small loader while auth is initializing (not after)
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // ✅ Choose navbar based on role
  const NavbarComponent =
    user?.role === "customer"
      ? CustomerNavbar
      : user?.role === "provider"
      ? ProviderNavbar
      : user?.role === "admin"
      ? AdminNavbar
      : PublicNavbar;

  const fadeVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-all duration-300">
      {/* 🎬 Logo Reveal runs only once */}
      {!logoDone && <LogoReveal onComplete={() => setLogoDone(true)} />}

      {/* ✅ Navbar appears after logo animation completes */}
      {logoDone && (
        <AnimatePresence mode="wait">
          <motion.div
            key={navbarKey}
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={fadeVariants}
            transition={{ duration: 0.35, ease: "easeInOut" }}
          >
            <NavbarComponent />
          </motion.div>
        </AnimatePresence>
      )}

      {/* ✅ Always render routes (even during logo), prevents blank */}
      <main className="flex-1">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Role Selection */}
          <Route
            path="/choose-role"
            element={
              <ProtectedRoute>
                {user?.role ? (
                  <Navigate to="/welcome" replace />
                ) : (
                  <RoleSelectPage />
                )}
              </ProtectedRoute>
            }
          />

          {/* Welcome */}
          <Route
            path="/welcome"
            element={
              <ProtectedRoute>
                <WelcomePage />
              </ProtectedRoute>
            }
          />

          {/* Customer */}
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

          {/* Provider */}
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

          {/* Admin */}
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

          {/* Profile */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
