import { RouterProvider } from "react-router-dom";
import { adminRouter } from "./portals/admin/router";
import { superAdminRouter } from "./portals/superadmin/router";

export default function App() {
  const path = window.location.pathname;

  // ALWAYS redirect root "/" → "/admin"
  if (path === "/") {
    window.location.replace("/admin");
    return null;
  }

  if (path.startsWith("/super")) {
    return <RouterProvider router={superAdminRouter} />;
  }

  return <RouterProvider router={adminRouter} />;
}
