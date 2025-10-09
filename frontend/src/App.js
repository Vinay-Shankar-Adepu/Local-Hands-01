import React, { useState, useMemo } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleGuard from "./components/RoleGuard";
import LogoReveal from "./components/LogoReveal";
import { AnimatePresence, motion } from "framer-motion";
import { ToastProvider } from "./components/Toast";

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
import ForgotPassword from "./pages/ForgotPassword";
import ProviderVerificationPage from "./pages/ProviderVerificationPage"; // ✅ dedicated verification page

export default function App() {
  const { user, loading } = useAuth();

  // ✅ Show logo only once per session
  const [logoDone, setLogoDone] = useState(
    sessionStorage.getItem("logo_seen") === "true"
  );

  const handleLogoComplete = () => {
    setLogoDone(true);
    sessionStorage.setItem("logo_seen", "true");
  };

  // ✅ Normalize user role safely
  const normalizedRole = useMemo(
    () => (user?.role ? String(user.role).trim().toLowerCase() : null),
    [user?.role]
  );

  // ✅ Choose Navbar based on role
  const NavbarComponent = useMemo(() => {
    switch (normalizedRole) {
      case "customer":
        return CustomerNavbar;
      case "provider":
        return ProviderNavbar;
      case "admin":
        return AdminNavbar;
      default:
        return PublicNavbar;
    }
  }, [normalizedRole]);

  // ✅ Loading spinner while auth initializes
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const fadeVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
  };

  return (
    <ToastProvider>
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-all duration-300">
        {/* 🎬 Logo animation (plays once per session) */}
        <AnimatePresence>
          {!logoDone && <LogoReveal onComplete={handleLogoComplete} />}
        </AnimatePresence>

        {/* 🧭 Navbar (appears after logo reveal) */}
        {logoDone && (
          <AnimatePresence mode="wait">
            <motion.div
              key={user?.role || "public"}
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

        {/* 🧩 Main Routes */}
        <main className="flex-1">
          <Routes>
            {/* 🌐 Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* 🧍 Role Selection */}
            <Route
              path="/choose-role"
              element={
                <ProtectedRoute>
                  {user?.role ? (
                    normalizedRole === "provider" ? (
                      <Navigate to="/provider" replace />
                    ) : normalizedRole === "customer" ? (
                      <Navigate to="/customer" replace />
                    ) : normalizedRole === "admin" ? (
                      <Navigate to="/admin" replace />
                    ) : (
                      <Navigate to="/welcome" replace />
                    )
                  ) : (
                    <RoleSelectPage />
                  )}
                </ProtectedRoute>
              }
            />

            {/* 👋 Welcome Page */}
            <Route
              path="/welcome"
              element={
                <ProtectedRoute>
                  <WelcomePage />
                </ProtectedRoute>
              }
            />

            {/* 👩‍💼 Customer Routes */}
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

            {/* 🧰 Provider Routes */}
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
            <Route
              path="/provider/verification"
              element={
                <ProtectedRoute>
                  <RoleGuard allow={["provider"]}>
                    <ProviderVerificationPage />
                  </RoleGuard>
                </ProtectedRoute>
              }
            />

            {/* 🛡️ Admin Routes */}
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

            {/* 👤 Profile */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />

            {/* 🔁 Default Redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </ToastProvider>
  );
}
