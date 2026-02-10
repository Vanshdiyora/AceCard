// import { Navigate } from "react-router-dom";
// import { useAppSelector } from "../app/hooks";
// import { isOnSubdomain, redirectToSubdomain } from "./subDomain";
// export default function RootRedirect() {
//   const { token, role, loading, subdomain } = useAppSelector((s) => s.auth);

//   if (loading) return null;

//   // 1️⃣ Not logged in → base login only
//   if (!token) {
//     return <Navigate to="/login" replace />;
//   }

//   // 2️⃣ Super admin → base domain only
//   if (role === "super_admin") {
//     return <Navigate to="/super" replace />;
//   }

//   // 3️⃣ Tenant users MUST be on subdomain
//   if (role === "manager" || role === "vendor_admin" || role === "sales_rep") {
//     if (!subdomain) {
//       // safety net
//       return <Navigate to="/unauthorized" replace />;
//     }

//     // 🚨 Enforce subdomain
//     if (!isOnSubdomain()) {
//       const path =
//         role === "sales_rep" ? "profile-settings" : "admin";

//       redirectToSubdomain(subdomain, path);
//       return null;
//     }

//     // already on correct subdomain → normal routing
//     if (role === "sales_rep") {
//       return <Navigate to="/profile-settings" replace />;
//     }

//     return <Navigate to="/admin" replace />;
//   }

//   return <Navigate to="/unauthorized" replace />;
// }
