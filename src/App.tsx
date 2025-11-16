import AdminPortal from "./portals/admin";
import SuperAdminPortal from "./portals/superadmin";

export default function App() {
  if (false) return <SuperAdminPortal />;
  return <AdminPortal />;
}
