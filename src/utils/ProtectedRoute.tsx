import { Navigate } from "react-router-dom";
import { useAppSelector } from "../app/hooks";
import type { ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
  superOnly?: boolean;
}

export default function ProtectedRoute({ children, superOnly = false }: ProtectedRouteProps) {
  const { token, role } = useAppSelector((s) => s.auth);

  if (!token) return <Navigate to="/login" replace />;

  // Super admin only routes
  if (superOnly && role !== "super_admin") {
    return <Navigate to="/admin" replace />;
  }

  // ALWAYS WRAP CHILDREN
  return <>{children}</>;
}
