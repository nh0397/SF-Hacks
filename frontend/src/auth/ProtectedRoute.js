import React from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const token = sessionStorage.getItem("token"); // ✅ Check sessionStorage

  return token ? children : <Navigate to="/login" replace />;
}
