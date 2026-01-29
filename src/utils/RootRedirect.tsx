import { Navigate } from "react-router-dom";
import { useAppSelector } from "../app/hooks";

export default function RootRedirect() {
  const { token, role, loading } = useAppSelector((s) => s.auth);

  if (loading) return null; // ⬅ wait

  if (!token || !role) return <Navigate to="/login" replace />;

  if (role === "super_admin") return <Navigate to="/super" replace />;
  if (role === "manager" || role === "vendor_admin") return <Navigate to="/admin" replace />;

  return <Navigate to="/unauthorized" replace />;
}
