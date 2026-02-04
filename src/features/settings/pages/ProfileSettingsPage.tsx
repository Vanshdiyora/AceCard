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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 flex justify-center">
      <div className="w-full max-w-5xl space-y-6">

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
                  onLogout={handleLogout}
                />

              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
