import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./utils/ProtectedRoute";
// import RootRedirect from "./utils/RootRedirect";

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
import VendorTeamActivityPage from "./features/vendors/pages/VendorTeamPage";
import PaymentsPage from "./features/paymentHistory/pages/PaymentsPage";

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
  NotificationVendorPage,
} from "./features/index";
import VicePublicPage from "./features/settings/components/vice/page/VicePublicPage";
import PublicProfilePage from "./features/publicProfile/pages/PublicProfilePage";
import ProfileSettingsPage from "./features/settings/pages/ProfileSettingsPage";
import { useEffect } from "react";
import { useAppDispatch } from "./app/hooks";
import { hydrateAuth } from "./features/auth/slice";

export default function App() {
    const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(hydrateAuth());
  }, [dispatch]);

  return (
    <BrowserRouter>
      <Routes>
        {/* ROOT */}
        <Route path="/" element={<LoginPage />} />

        {/* AUTH / PUBLIC */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="/not-found" element={<PageNotFound />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/verify-otp" element={<VerifyOtpPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* PUBLIC PROFILE */}
        <Route path="/profile/:username" element={<PublicProfilePage />} />

        {/* PROFILE SETTINGS (TENANT → SUBDOMAIN ONLY) */}
        <Route
          path="/profile-settings"
          element={
            <ProtectedRoute requireSubdomain>
              <ProfileSettingsPage />
            </ProtectedRoute>
          }
        />

        {/* SUPER ADMIN ROUTES (BASE DOMAIN ONLY) */}
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
          <Route path="vendors/:id/team" element={<VendorTeamActivityPage />} />
          <Route path="support" element={<SupportAdmin />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="payments" element={<PaymentsPage />} />
          <Route path="*" element={<Navigate to="/not-found" replace />} />
        </Route>

        {/* ADMIN ROUTES (TENANT → SUBDOMAIN ONLY) */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute adminOnly requireSubdomain> {/* 🔥 */}
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
          <Route path="settings/viceview" element={<VicePublicPage />} />
          <Route path="*" element={<Navigate to="/not-found" replace />} />
        </Route>

        {/* INTEGRATIONS CALLBACK (INTENTIONALLY UNPROTECTED) */}
        <Route
          path="/integrations/:provider/callback"
          element={<IntegrationCallback />}
        />
      </Routes>
    </BrowserRouter>
  );
}
