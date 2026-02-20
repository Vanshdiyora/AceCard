import { Outlet, useLocation, useNavigate } from "react-router-dom";
import SettingsSidebar from "../components/SettingsSidebar";
import ProfileSettingsSidebar from "../components/ProfileSettingSidebar";

export default function SettingsPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const path = location.pathname.replace("/admin/settings", "");

  const active =
    path === "" || path === "/"
      ? "account"
      : path.replace("/", "");

  const isProfile = active === "profile-settings";

  const handleChange = (value: string) => {
    if (value === "account") {
      navigate("/admin/settings");
    } else {
      navigate(`/admin/settings/${value}`);
    }
  };

  return (
    <div className="">
      <div className="max-w-7xl mx-auto">

        {/* Hide header in profile mode if you want */}
        {!isProfile && (
          <div className="flex items-center justify-between mb-8 px-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Settings
              </h1>
              <p className="text-gray-600 text-sm">
                Manage your account configurations
              </p>
            </div>
          </div>
        )}

        {isProfile ? (
          <div className="flex gap-8">

            {/* Profile Sidebar */}
            <div className="shrink-0">
              <ProfileSettingsSidebar
                active={active}
                onChange={handleChange}
              />
            </div>

            {/* Profile Content */}
            <div className="flex-1">
              <Outlet />
            </div>

          </div>
        ) : (
          /* 🔥 NORMAL SETTINGS MODE */
          <div className="flex gap-8 p-6">

            <div className="w-64 sticky top-20 self-start">
              <SettingsSidebar
                active={active}
                onChange={handleChange}
              />
            </div>

            <div className="flex-1 rounded-3xl">
              <Outlet />
            </div>

          </div>
        )}

      </div>
    </div>
  );
}