import { createBrowserRouter } from "react-router-dom";
import SuperAdminLayout from "./layout/SuperAdminLayout";

import SuperDashboardPage from "./pages/DashBoard/SuperDashBoard";
import SalespersonPage from "./pages/Salesperson/SalespersonPage";
import SeatsPage from "./pages/SeatsKeysPage/SeatsKeysPage";
import { SupportAdmin, VendorsPage} from "../../features/index";

export const superAdminRouter = createBrowserRouter([
  {
    path: "/super",
    element: <SuperAdminLayout />,
    children: [
      { index: true, element: <SuperDashboardPage /> },
      { path: "vendors", element: <VendorsPage /> },
      { path: "salespersons", element: <SalespersonPage /> },
      { path: "seats", element: <SeatsPage /> },
      { path: "support", element: <SupportAdmin /> },
//       { path: "analytics", element: <AnalyticsPage /> },
//       { path: "tickets", element: <TicketsPage /> },
//       { path: "system-settings", element: <SystemSettingsPage /> },
//       { path: "notifications", element: <NotificationsPage /> },
    ],
  },
]);
