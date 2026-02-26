import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import type { IconType } from "react-icons";
import { IoNotifications } from "react-icons/io5";
import { CreditCard } from "lucide-react";
import { useAppDispatch } from "../../../app/hooks";
import { logout } from "../../../features/auth/slice";
import { resetSettings } from "../../../features/settings/slice";
import { eraseCookie } from "../../../utils/cookieUtils";
import { LogOut } from "lucide-react";
import GlobalSignOutConfirmationModal from "../../ui/GlobalSignOutConfirmationModal";

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
  const dispatch = useAppDispatch();
  const [signOutOpen, setSignOutOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
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
  const handleLogout = async () => {
    try {
      setSigningOut(true);

      dispatch(logout());
      eraseCookie("token");
      eraseCookie("subdomain");
      dispatch(resetSettings());

      window.location.href = "/login";
    } finally {
      setSigningOut(false);
      setSignOutOpen(false);
    }
  };
  return (
    <aside className="sticky top-0 h-screen w-64 p-6 shrink-0 flex flex-col"

      style={{ backgroundColor: "white" }}
    >
      <div className="flex justify-center mb-2">
        <img src="/fullLogo.png" className="h-20 object-contain text-black" />
      </div>

      <ul className="space-y-2 flex-1">
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
      {/* Logout Button */}
      <div className="pt-4 border-t">
        <button
          onClick={() => setSignOutOpen(true)}
          className="w-full flex items-center gap-3 px-4 py-2 rounded-3xl transition text-red-600 hover:bg-red-50"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>

      <GlobalSignOutConfirmationModal
        open={signOutOpen}
        loading={signingOut}
        onCancel={() => setSignOutOpen(false)}
        onConfirm={handleLogout}
      />
    </aside>
  );
}
