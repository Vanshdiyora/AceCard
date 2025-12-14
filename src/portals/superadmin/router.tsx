import { createBrowserRouter } from "react-router-dom";
import ProtectedRoute from "../../utils/ProtectedRoute";
import SuperAdminLayout from "./layout/SuperAdminLayout";
import SuperDashboardPage from "./pages/DashBoard/SuperDashBoard";
import SalespersonPage from "./pages/Salesperson/SalespersonPage";
import SeatsPage from "./pages/SeatsKeysPage/SeatsKeysPage";
import { SupportAdmin, VendorsPage } from "../../features";

export const superAdminRouter = createBrowserRouter([
  {
    path: "/super",
    element: (
      <ProtectedRoute superOnly={true}>
        <SuperAdminLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <SuperDashboardPage />,
      },
      {
        path: "vendors",
        element: <VendorsPage />,
      },
      {
        path: "salespersons",
        element: <SalespersonPage />,
      },
      {
        path: "seats",
        element: <SeatsPage />,
      },
      {
        path: "support",
        element: <SupportAdmin />,
      },
    ],
  },
]);
