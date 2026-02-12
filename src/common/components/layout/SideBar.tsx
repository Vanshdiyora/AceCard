import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import type { IconType } from "react-icons";
import { IoNotifications } from "react-icons/io5";
import { CreditCard } from "lucide-react";

type MenuItem = {
  label: string;
  path: string;
  icon: string | IconType; // 👈 allow both
};

type SidebarProps = {
  type: "admin" | "superadmin";
};

export default function Sidebar({ type }: SidebarProps) {
  const location = useLocation();
  const [hovered, setHovered] = useState<string | null>(null);

  const adminBase = "/admin";
  const superBase = "/super";

  const adminMenu: MenuItem[] = [
    { label: "Dashboard", path: `${adminBase}`, icon: "/sidebar/dashboard.png" },
    { label: "Leads", path: `${adminBase}/leads`, icon: "/sidebar/leads.png" },
    { label: "Campaigns", path: `${adminBase}/campaigns`, icon: "/sidebar/campaigns.png" },
    { label: "Team", path: `${adminBase}/team`, icon: "/sidebar/team.png" },
    { label: "Products", path: `${adminBase}/products`, icon: "/sidebar/products.png" },
    { label: "Support", path: `${adminBase}/support`, icon: "/sidebar/support.png" },
    { label: "Notifications", path: `${adminBase}/notifications`, icon: IoNotifications },
    { label: "Settings", path: `${adminBase}/settings`, icon: "/sidebar/settings.png" },
  ];

  const superMenu: MenuItem[] = [
    { label: "Vendors", path: `${superBase}/vendors`, icon: "/sidebar/vendors.png" },
    { label: "Tickets & Support", path: `${superBase}/support`, icon: "/sidebar/support.png" },
    // { label: "System Settings", path: `${superBase}/system-settings`, icon: "/sidebar/settings.png" },
    { label: "Notifications", path: `${superBase}/notifications`, icon: IoNotifications },
    { label: "Payments", path: `${superBase}/payments`, icon: CreditCard },

  ];

  const menu = type === "superadmin" ? superMenu : adminMenu;

  return (
    <aside className="sticky top-0 h-screen w-64 p-6 shrink-0"

      style={{ backgroundColor: "white" }}
    >
      <div className="flex justify-center mb-2">
        <img src="/fullLogo.png" className="h-20 object-contain text-black" />
      </div>

      <ul className="space-y-2">
        {menu.map((item) => {
          const currentPath = location.pathname.replace(/\/$/, "");

          const isActive =
            item.path === adminBase || item.path === superBase
              ? currentPath === item.path
              : currentPath.startsWith(item.path);

          const isHovered = hovered === item.path;

          return (
            <li key={item.path} className="relative">
              {/* Left indicator */}
              <span
                className={`absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-full transition-all
                  ${isHovered && !isActive ? "bg-[#9A8FC2]" : "bg-transparent"}
                `}
              />
              <Link
                to={item.path}
                onMouseEnter={() => setHovered(item.path)}
                onMouseLeave={() => setHovered(null)}
                className="flex items-center gap-3 px-4 py-2 rounded-3xl transition"
                style={{
                  backgroundColor: isActive ? "#2D1A53" : "transparent",
                  color: isActive ? "#FFFFFF" : "#4B3B7A",
                }}
              >
                {typeof item.icon === "string" ? (
                  <img
                    src={item.icon}
                    className={`w-4 h-4 transition-transform duration-200 ${isHovered ? "scale-110" : "scale-100"
                      }`}
                    style={{
                      filter: isActive ? "brightness(0) invert(1)" : "none",
                    }}
                  />
                ) : (
                  <item.icon
                    size={18}
                    className={`w-4 h-4 transition-transform duration-200 ${isHovered ? "scale-110" : "scale-100"
                      }`}
                    color={isActive ? "#FFFFFF" : "#4B3B7A"}
                  />
                )}

                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
