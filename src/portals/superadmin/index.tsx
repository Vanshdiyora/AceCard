import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { superAdminRouter } from "./router";

export default function SuperAdminPortal() {
  useEffect(() => {
    document.title = "Super Admin";
  }, []);

  return <RouterProvider router={superAdminRouter} />;
}
