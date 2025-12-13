import { RouterProvider } from "react-router-dom";
import { adminRouter } from "./portals/admin/router";
import { superAdminRouter } from "./portals/superadmin/router";
import LoginPage from "./features/auth/pages/LoginPage";

export default function App() {
  const path = window.location.pathname;

  // If user is at /login → render login page directly
  if (path.startsWith("/login")) {
    return <LoginPage />;
  }

  // redirect "/" → "/admin"
  if (path === "/") {
    window.location.replace("/admin");
    return null;
  }

  // super admin portal routes
  if (path.startsWith("/super")) {
    return <RouterProvider router={superAdminRouter} />;
  }

  // admin routes
  return <RouterProvider router={adminRouter} />;
}
