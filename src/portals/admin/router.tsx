import { createBrowserRouter } from "react-router-dom";
import AdminLayout from "./layout/AdminLayout";

import LeadsPage from "../../features/leads/pages/LeadsPage";
import { ProductsPage, SupportPage, TeamPage, DashboardPage, CampaignsPage } from "../../features/index";
import SettingsPage from "./pages/Settings/SettingsPage";

export const adminRouter = createBrowserRouter([
  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "leads", element: <LeadsPage /> },
      { path: "campaigns", element: <CampaignsPage /> },
      { path: "team", element: <TeamPage /> },
      { path: "products", element: <ProductsPage /> },
      { path: "settings", element: <SettingsPage /> },
      { path: "support", element: <SupportPage /> }
    ],
  },
]);
