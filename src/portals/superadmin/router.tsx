import { createBrowserRouter, Navigate } from "react-router-dom";
import ProtectedRoute from "../../utils/ProtectedRoute";
import SuperAdminLayout from "./layout/SuperAdminLayout";
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
        element: <Navigate to="vendors" replace />,
      },
      {
        path: "vendors",
        element: <VendorsPage />,
      },
      {
        path: "support",
        element: <SupportAdmin />,
      },
    ],
  },
]);
