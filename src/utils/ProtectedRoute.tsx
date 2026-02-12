import { Navigate, useLocation } from "react-router-dom";
import { useAppSelector } from "../app/hooks";
import type { ReactNode } from "react";
import { isOnSubdomain, redirectToSubdomain } from "./subDomain";

interface ProtectedRouteProps {
  children: ReactNode;
  superOnly?: boolean;
  adminOnly?: boolean;
  requireSubdomain?: boolean;
}

export default function ProtectedRoute({
  children,
  superOnly = false,
  adminOnly = false,
  requireSubdomain = false,
}: ProtectedRouteProps) {
  // ✅ ALL hooks must be at the top, no conditions
  const location = useLocation();
  const { token, role, loading, subdomain, hydrated } = useAppSelector(
    (s) => s.auth
  );
  const hostname = window.location.hostname;
  const isVercel = hostname.endsWith("vercel.app");
  const isLocalhost =
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname.endsWith(".localhost");

  // ✅ SAFE early exits (after hooks)
  if (!hydrated || loading) {
    return null;
  }

  // 🔐 Not logged in
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // 👑 Super admin only
  if (superOnly && role !== "super_admin") {
    return <Navigate to="/admin" replace />;
  }

  // 🚫 Admin pages blocked for sales_rep & super_admin
  if (adminOnly && (role === "sales_rep" || role === "super_admin")) {
    return <Navigate to="/unauthorized" replace />;
  }

  // 🚨 Enforce subdomain for tenant users
  if (
    requireSubdomain &&
    !isVercel &&
    !isLocalhost &&   // ✅ ADD THIS
    (role === "manager" || role === "vendor_admin" || role === "sales_rep")
  ) {


    if (!subdomain) {
      return <Navigate to="/unauthorized" replace />;
    }

    if (!isOnSubdomain()) {
      const fullPath =
        location.pathname + location.search + location.hash;

      redirectToSubdomain(subdomain, fullPath);
      return null;
    }
  }

  return <>{children}</>;
}
