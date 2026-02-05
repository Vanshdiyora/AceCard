import { Navigate } from "react-router-dom";
import { useAppSelector } from "../app/hooks";

export default function RootRedirect() {
  const { token, role, loading } = useAppSelector((s) => s.auth);

  if (loading) return null;

  if (!token) return <Navigate to="/login" replace />;

  if (role === "sales_rep") {
    return <Navigate to="/profile-settings" replace />;
  }

  if (role === "super_admin") {
    return <Navigate to="/super" replace />;
  }

  return <Navigate to="/admin" replace />;
}
