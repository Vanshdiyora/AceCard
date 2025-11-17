import { createBrowserRouter } from "react-router-dom";
import SuperAdminLayout from "./layout/SuperAdminLayout";

import SuperDashboardPage from "./pages/DashBoard/SuperDashBoard";
import VendorsPage from "./pages/Vendors/VendorsPage";
import SalespersonPage from "./pages/Salesperson/SalespersonPage";
import SeatsPage from "./pages/SeatsKeysPage/SeatsKeysPage";
// import AnalyticsPage from "./pages/Analytics";
// import TicketsPage from "./pages/Tickets";
// import SystemSettingsPage from "./pages/SystemSettings";
// import NotificationsPage from "./pages/Notifications";

export const superAdminRouter = createBrowserRouter([
  {
    path: "/super",
    element: <SuperAdminLayout />,
    children: [
      { index: true, element: <SuperDashboardPage /> },
      { path: "vendors", element: <VendorsPage /> },
      { path: "salespersons", element: <SalespersonPage /> },
      { path: "seats", element: <SeatsPage /> },
//       { path: "analytics", element: <AnalyticsPage /> },
//       { path: "tickets", element: <TicketsPage /> },
//       { path: "system-settings", element: <SystemSettingsPage /> },
//       { path: "notifications", element: <NotificationsPage /> },
    ],
  },
]);
