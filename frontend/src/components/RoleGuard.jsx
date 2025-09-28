import React from "react";
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

export default function RoleGuard({ allow = [], children }) {
  const { user } = useAuth();
  if (!user?.role || !allow.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  return children;
}
