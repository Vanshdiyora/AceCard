import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { loadMyProfile } from "../../publicProfile/slice";
import { logout } from "../../../features/auth/slice";
import { resetSettings } from "../../../features/settings/slice";

import MobilePublicSettings, {
  BackgroundLayer,
} from "../../publicProfile/components/MobilePublicSettings/MobilePublicSettings";

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

  useEffect(() => {
    if (role && role !== "sales_rep") {
      navigate("/unauthorized", { replace: true });
    }
  }, [role, navigate]);

  useEffect(() => {
    dispatch(loadMyProfile());
  }, [dispatch]);

  if (loading || !myProfile) {
    return <div className="text-center mt-20">Loading profile...</div>;
  }

  const config = (myProfile?.configuration ?? {}) as any;

  return (
    <div className="min-h-screen">

      {/* ================= MOBILE ================= */}
      {/*
        isPreview not passed (defaults false) → component renders its own
        BackgroundLayer with positionClass="fixed" inside itself.
      */}
      <div className="sm:hidden bg-white" style={{ height: '100dvh' }}>
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

      {/* ================= DESKTOP ================= */}
      <div className="hidden sm:flex justify-center items-center min-h-screen">
        <div className="relative h-[100vh] aspect-[10/19] max-w-[420px] overflow-hidden rounded-[2rem]">

          {/*
            ✅ KEY FIX: BackgroundLayer lives HERE as a sibling to the scroll
            container. positionClass="absolute" anchors it to this div (the
            nearest `relative` ancestor). The parent's `overflow-hidden` clips
            it inside the phone mockup frame. Because it is OUTSIDE the
            scrollable div, it never moves when content scrolls.
          */}
          <BackgroundLayer
            layout={config.layout}
            theme={config.theme}
            positionClass="absolute"
          />

          {/* Scrollable content — sits on top of the fixed background */}
          <div className="relative z-10 w-full h-full bg-transparent">
            <div
              ref={scrollRef}
              className="h-full w-full overflow-y-auto no-scrollbar"
            >
              <MobilePublicSettings
                data={myProfile}
                scrollRef={scrollRef}
                onLogout={handleLogout}
                isPreview={true}
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}