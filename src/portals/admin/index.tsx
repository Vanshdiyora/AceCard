import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { adminRouter } from "./router";

export default function AdminPortal() {
  useEffect(() => {
    document.title = "Admin Panel";
  }, []);

  return <RouterProvider router={adminRouter} />;
}
