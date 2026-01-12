import { Navigate, useLocation } from "react-router-dom";
import { useAppSelector } from "../app/hooks";
import type { ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
  superOnly?: boolean;
  adminOnly?: boolean;
}

export default function ProtectedRoute({
  children,
  superOnly = false,
  adminOnly = false,
}: ProtectedRouteProps) {
  const { token, role } = useAppSelector((s) => s.auth);
  const location = useLocation();

  // Not logged in
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Super admin only
  if (superOnly && role !== "super_admin") {
    return <Navigate to="/admin" replace />;
  }

  // Admin only
  if (adminOnly && (role === "sales_rep" || role === "super_admin")) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}
