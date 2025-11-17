import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Building2,
  Key,
  BarChart2,
  LifeBuoy,
  Settings,
  Bell
} from "lucide-react";

type SidebarProps = {
  type: "admin" | "superadmin";
};

export default function Sidebar({ type }: SidebarProps) {
  const location = useLocation();

  const adminBase = "/admin";
  const superBase = "/super";

  const adminMenu = [
    { icon: LayoutDashboard, label: "Dashboard", path: `${adminBase}` },
    { icon: Users, label: "Leads", path: `${adminBase}/leads` },
    { icon: BarChart2, label: "Campaigns", path: `${adminBase}/campaigns` },
    { icon: Users, label: "Team", path: `${adminBase}/team` },
    { icon: Building2, label: "Products", path: `${adminBase}/products` },
    { icon: BarChart2, label: "Insights", path: `${adminBase}/insights` },
    { icon: LifeBuoy, label: "Support", path: `${adminBase}/support` },
    { icon: Settings, label: "Settings", path: `${adminBase}/settings` },
  ];

  const superMenu = [
    { icon: LayoutDashboard, label: "Dashboard", path: `${superBase}` },
    { icon: Building2, label: "Vendors", path: `${superBase}/vendors` },
    { icon: Users, label: "Salespersons", path: `${superBase}/salespersons` },
    { icon: Key, label: "Seats & Keys", path: `${superBase}/seats` },
    { icon: BarChart2, label: "Usage & Analytics", path: `${superBase}/analytics` },
    { icon: LifeBuoy, label: "Tickets & Support", path: `${superBase}/tickets` },
    { icon: Settings, label: "System Settings", path: `${superBase}/system-settings` },
    { icon: Bell, label: "Notifications", path: `${superBase}/notifications` },
  ];

  const menu = type === "superadmin" ? superMenu : adminMenu;

  return (
    <aside className="w-64 bg-white h-screen border-r shadow-sm p-6">
      <h1 className="text-2xl font-bold text-purple-700 mb-10">
        {type === "superadmin" ? "AceCard Super Admin" : "AceCard"}
      </h1>

      <nav className="space-y-2">
        {menu.map((item) => {
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-md transition
                ${
                  isActive
                    ? "bg-purple-50 text-purple-700 font-medium"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <p className="absolute bottom-6 left-6 text-xs text-gray-400">
        Version 1.0.0
      </p>
    </aside>
  );
}
