import { createBrowserRouter } from "react-router-dom";
import ProtectedRoute from "../../utils/ProtectedRoute";
import AdminLayout from "./layout/AdminLayout";
import { DashboardPage, LeadPage, CampaignsPage, TeamPage, ProductsPage, SupportPage, SettingsPage } from "../../features/index";
import LeadDetailsPage from "../../features/leads/pages/LeadDetailsPage";

export const adminRouter = createBrowserRouter([
  {
    path: "/admin",
    element: (
      <ProtectedRoute>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: "leads",
        element: <LeadPage />,
      },
      {
        path: "leads/:id",
        element: <LeadDetailsPage />,
      },
      {
        path: "campaigns",
        element: <CampaignsPage />,
      },
      {
        path: "team",
        element: <TeamPage />,
      },
      {
        path: "products",
        element: <ProductsPage />,
      },
      {
        path: "settings",
        element: <SettingsPage />,
      },
      {
        path: "support",
        element: <SupportPage />,
      },
    ],
  },
]);
