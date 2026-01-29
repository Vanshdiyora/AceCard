import { Navigate } from "react-router-dom";
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
  const { token, role, hydrated, loading } = useAppSelector((s) => s.auth);
  console.log("ProtectedRoute auth state:", { token, role, hydrated, loading });
  
  if (loading) return null; // ⬅ wait for auth resolution

  if (!token) return <Navigate to="/login" replace />;

  if (superOnly && role !== "super_admin") return <Navigate to="/admin" replace />;

  if (adminOnly && (role === "sales_rep" || role === "super_admin"))
    return <Navigate to="/unauthorized" replace />;

  return <>{children}</>;
}
