import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import {
    loadMyProfile,
} from "../../publicProfile/slice";
import { logout } from "../../../features/auth/slice";
import { resetSettings } from "../../../features/settings/slice";

import TeamMemberPublicProfileTab from "../../teams/components/details/publicProfile/TeamMemberPublicProfileTab";

export default function ProfileSettingsPage() {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { role } = useAppSelector((s) => s.auth);
    const handleLogout = () => {
        dispatch(logout());
        dispatch(resetSettings());
        navigate("/login", { replace: true });
    };

    // 🔐 only sales reps allowed
    useEffect(() => {
        if (role && role !== "sales_rep") {
            navigate("/unauthorized", { replace: true });
        }
    }, [role, navigate]);

    // load own profile
    useEffect(() => {
        dispatch(loadMyProfile());
    }, [dispatch]);

  return (
  <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 flex justify-center py-10 px-4">
    <div className="w-full max-w-5xl space-y-6">

      {/* Header */}
      <div className="sticky top-0 z-20 bg-white/70 backdrop-blur rounded-2xl shadow-sm px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">
            My Public Profile
          </h1>
          <p className="text-sm text-gray-500">
            Manage how your card looks to customers
          </p>
        </div>

        {role === "sales_rep" && (
          <button
            onClick={handleLogout}
            className="text-sm font-medium text-red-600 hover:text-red-700 transition"
          >
            Sign out
          </button>
        )}
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8 space-y-6">
        <TeamMemberPublicProfileTab
          useSelfApi
          showLockable={false}
        />
      </div>

      {/* Danger Zone */}
      {role === "sales_rep" && (
        <div className="bg-white rounded-2xl border border-red-200 p-5 space-y-3">
          <h3 className="text-sm font-semibold text-red-600">
            Danger Zone
          </h3>
          <p className="text-xs text-gray-500">
            Signing out will end your session on this device.
          </p>

          <button
            onClick={handleLogout}
            className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-red-500 to-rose-600 shadow hover:opacity-90 transition"
          >
            Sign Out
          </button>
        </div>
      )}

    </div>
  </div>
);

}
