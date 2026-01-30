import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./utils/ProtectedRoute";
import RootRedirect from "./utils/RootRedirect";

import LoginPage from "./features/auth/pages/LoginPage";
import SuperAdminLayout from "./portals/superadmin/layout/SuperAdminLayout";
import AdminLayout from "./portals/admin/layout/AdminLayout";
import UnauthorizedPage from "./features/auth/pages/UnauthorizedPage";
import PageNotFound from "./common/pages/PageNotFound";
import ForgotPasswordPage from "./features/auth/pages/ForgotPasswordPage";
import VerifyOtpPage from "./features/auth/pages/VerifyOtpPage";
import ResetPasswordPage from "./features/auth/pages/ResetPasswordPage";
import IntegrationCallback from "./features/settings/pages/IntegrationCallback";
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
  NotificationVendorPage
} from "./features/index";
import PublicProfilePage from "./features/publicProfile/pages/PublicProfilePage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ROOT */}
        <Route path="/" element={<RootRedirect />} />

        {/* LOGIN */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="/not-found" element={<PageNotFound />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/verify-otp" element={<VerifyOtpPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
{/* PUBLIC PROFILE */}
<Route path="/profile/:username" element={<PublicProfilePage />} />

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
          <Route path="notifications" element={<NotificationVendorPage />} />
          <Route path="*" element={<Navigate to="/not-found" replace />} />
        </Route>
<Route
  path="/integrations/:provider/callback"
  element={<IntegrationCallback />}
/>

        {/* GLOBAL FALLBACK */}
        {/* <Route path="*" element={<Navigate to="/not-found" replace />} /> */}
      </Routes>
    </BrowserRouter>
  );
}
