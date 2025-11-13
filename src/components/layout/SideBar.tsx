import { Link, useLocation } from "react-router-dom";

export default function Sidebar() {
  const location = useLocation();

  const menu = [
    { label: "Dashboard", path: "/" },
    { label: "Leads", path: "/leads" },
    { label: "Campaigns", path: "/campaigns" },
    { label: "Team", path: "/team" },
    { label: "Products", path: "/products" },
    { label: "Insights", path: "/insights" },
    { label: "Support", path: "/support" },
    { label: "Settings", path: "/settings" },
  ];

  return (
    <aside className="w-64 bg-white border-r h-screen p-6 shadow-sm">
      <h1 className="text-2xl font-bold text-purple-600 mb-8">AceCard</h1>

      <nav className="space-y-2">
        {menu.map((item) => {
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`block p-2 rounded-md text-gray-700 cursor-pointer 
                hover:bg-gray-100 transition 
                ${isActive ? "bg-gray-100 font-semibold text-purple-600" : ""}`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
