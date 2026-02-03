import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { loadMyProfile } from "../../publicProfile/slice";
import { logout } from "../../../features/auth/slice";
import { resetSettings } from "../../../features/settings/slice";

import MobilePublicSettings from "../../publicProfile/components/MobilePublicSettings/MobilePublicSettings";

export default function ProfileSettingsPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const scrollRef = useRef<HTMLDivElement>(null);

  const { role } = useAppSelector((s) => s.auth);
  const { data: myProfile, loading } = useAppSelector((s) => s.publicProfile);

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

  // load own profile once
  useEffect(() => {
    dispatch(loadMyProfile());
  }, [dispatch]);

  if (loading || !myProfile) {
    return <div className="text-center mt-20">Loading profile...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 flex justify-center pt-6">
      <div className="w-full max-w-5xl space-y-6">

        {/* Header */}
        <div className="sticky top-0 z-20 bg-white/70 backdrop-blur rounded-2xl shadow-sm px-6 mx-4 py-4 flex items-center justify-between">
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

        {/* Phone Preview */}
        <div className="flex justify-center">
          <div className="w-full sm:max-w-[380px] sm:h-[720px] bg-black sm:rounded-[2.5rem] sm:p-2 shadow-2xl">
            <div className="w-full h-full bg-white sm:rounded-[2rem] overflow-hidden">
              <div
                ref={scrollRef}
                className="h-full overflow-y-auto no-scrollbar"
              >
                <MobilePublicSettings
                  data={myProfile}
                  scrollRef={scrollRef}
                />
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
