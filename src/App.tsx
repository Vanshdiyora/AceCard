import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./utils/ProtectedRoute";

import LoginPage from "./features/auth/pages/LoginPage";
import SuperAdminLayout from "./portals/superadmin/layout/SuperAdminLayout";
import AdminLayout from "./portals/admin/layout/AdminLayout";
import UnauthorizedPage from "./features/auth/pages/UnauthorizedPage";
import PageNotFound from "./common/pages/PageNotFound";

// SUPER ADMIN PAGES
import { SupportAdmin, VendorsPage } from "./features";
import LeadDetailsPage from "./features/leads/pages/LeadDetailsPage";

// ADMIN PAGES
import {
  SupportPage,
  DashboardPage,
  TeamPage,
  ProductsPage,
  CampaignsPage,
  LeadPage,
  SettingsPage,
  CampaignDetailsPage,
  TeamMemberDetailsPage,
  ProductDetailsPage,
  VendorDetailsPage,
  NotificationsPage,
} from "./features/index";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* LOGIN */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route path="/not-found" element={<PageNotFound />} />
        {/* SUPER ADMIN ROUTES */}
        <Route
          path="/super/*"
          element={
            <ProtectedRoute superOnly>
              <SuperAdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="vendors" replace />} />
          <Route path="vendors" element={<VendorsPage />} />
          <Route path="vendors/:id" element={<VendorDetailsPage />} />
          <Route path="support" element={<SupportAdmin />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="*" element={<Navigate to="/not-found" replace />} />
        </Route>

        {/* ADMIN ROUTES */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute adminOnly>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="leads" element={<LeadPage />} />
          <Route path="leads/:id" element={<LeadDetailsPage />} />
          <Route path="campaigns" element={<CampaignsPage />} />
          <Route path="campaigns/:id" element={<CampaignDetailsPage />} />
          <Route path="team" element={<TeamPage />} />
          <Route path="team/:id" element={<TeamMemberDetailsPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="products/:id" element={<ProductDetailsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="support" element={<SupportPage />} />
          <Route path="*" element={<Navigate to="/not-found" replace />} />
        </Route>

        {/* GLOBAL FALLBACK — NO LAYOUT */}
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
