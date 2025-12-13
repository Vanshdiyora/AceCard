import { createBrowserRouter } from "react-router-dom";
import AdminLayout from "./layout/AdminLayout";

import DashboardPage from "./pages/DashBoard/DashBoardPage"
import LeadsPage from "./pages/Leads/LeadsPage";
import CampaignsPage from "../../features/campaigns/pages/CampaignsPage";
import { ProductsPage, SupportPage, TeamPage } from "../../features/index";
import InsightsPage from "./pages/Insights/InsightsPage";
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
      { path: "insights", element: <InsightsPage /> },
      { path: "settings", element: <SettingsPage /> },
      { path: "support", element: <SupportPage /> }
    ],
  },
]);
