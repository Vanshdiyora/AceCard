import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./utils/ProtectedRoute";

import LoginPage from "./features/auth/pages/LoginPage";
import SuperAdminLayout from "./portals/superadmin/layout/SuperAdminLayout";
import AdminLayout from "./portals/admin/layout/AdminLayout";

// SUPER ADMIN PAGES
import SuperDashboardPage from "./portals/superadmin/pages/DashBoard/SuperDashBoard";
import SalespersonPage from "./portals/superadmin/pages/Salesperson/SalespersonPage";
import SeatsPage from "./portals/superadmin/pages/SeatsKeysPage/SeatsKeysPage";
import { SupportAdmin, VendorsPage } from "./features";
import LeadDetailsPage from "./features/leads/pages/LeadDetailsPage";
// ADMIN PAGES
import { SupportPage, DashboardPage, TeamPage , ProductsPage ,CampaignsPage ,LeadPage, SettingsPage} from "./features/index";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* LOGIN */}
        <Route path="/login" element={<LoginPage />} />

        {/* SUPER ADMIN ROUTES */}
        <Route
          path="/super/*"
          element={
            <ProtectedRoute superOnly={true}>
              <SuperAdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<SuperDashboardPage />} />
          <Route path="vendors" element={<VendorsPage />} />
          <Route path="salespersons" element={<SalespersonPage />} />
          <Route path="seats" element={<SeatsPage />} />
          <Route path="support" element={<SupportAdmin />} />
        </Route>

        {/* ADMIN ROUTES */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="leads" element={<LeadPage />} />
          <Route path="leads/:id" element={<LeadDetailsPage />} />
          <Route path="campaigns" element={<CampaignsPage />} />
          <Route path="team" element={<TeamPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="support" element={<SupportPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
