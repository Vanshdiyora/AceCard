import { createBrowserRouter } from "react-router-dom";
import AdminLayout from "./layout/AdminLayout";

import DashboardPage from "./pages/DashBoard/DashBoardPage"
import LeadsPage from "./pages/Leads/LeadsPage";
import CampaignsPage from "./pages/Campaigns/CampaignsPage";
import ProductsPage from "./pages/Products/ProductsPage";
import InsightsPage from "./pages/Insights/InsightsPage";
import SettingsPage from "./pages/Settings/SettingsPage";
import SupportPage from "./pages/Support/SupportPage";
import TeamPage from "./pages/Team/TeamPage";

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
      { path: "support", element: <SupportPage /> },
    ],
  },
]);
