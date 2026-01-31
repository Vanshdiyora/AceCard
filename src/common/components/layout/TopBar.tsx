import { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import NotificationBell from "./NotificationBell";
import GlobalSearch from "../../../features/globalSearch/components/GlobalSearch";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { logout } from "../../../features/auth/slice";
import {
  fetchAccountProfile,
  resetSettings,
} from "../../../features/settings/slice";

type TopbarProps = {
  type: "admin" | "super_admin";
};

export default function Topbar({ type }: TopbarProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const profile = useAppSelector((s) => s.settings.account.data);
  const profileLoading = useAppSelector((s) => s.settings.account.loading); // 🔴 added
  const jwtUser = useAppSelector((s) => s.auth.user);
  const token = useAppSelector((s) => s.auth.token);
const Avatar = ({ size = 40 }: { size?: number }) => {
  const [imgError, setImgError] = useState(false);

  if (profile?.avatar_url && !imgError) {
    return (
      <img
        src={profile.avatar_url}
        alt={name}
        className="rounded-full object-cover"
        style={{ width: size, height: size }}
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <div
      className="rounded-full bg-purple-600 text-white flex items-center justify-center font-medium"
      style={{ width: size, height: size }}
    >
      {initials}
    </div>
  );
};

  useEffect(() => {
    if (token) {
      dispatch(fetchAccountProfile());
    }
  }, [token, dispatch]);

  const name = useMemo(() => {
    return (
      profile?.name ||
      jwtUser?.name ||
      jwtUser?.email?.split("@")[0] ||
      ""
    );
  }, [profile, jwtUser]);

  const isLoadingUser = profileLoading || !name;

  const initials = name
    .split(" ")
    .map((n: any) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
  const handleMyProfile = () => {
    setOpen(false);
    requestAnimationFrame(() => {
      navigate("/admin/settings");
    });
  };

  const handleLogout = () => {
    setOpen(false);
    requestAnimationFrame(() => {
      dispatch(logout());
      dispatch(resetSettings());
      navigate("/login", { replace: true });
    });
  };


  const Dropdown = (
    <div
      className="absolute right-0 top-full mt-2 bg-white border shadow-xl rounded-lg w-44 z-50 origin-top-right"
      onClick={(e) => e.stopPropagation()}
    >
      {type === "admin" && (
        <button
          className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
          onClick={handleMyProfile}
        >
          My Profile
        </button>
      )}

      <button
        className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-red-600"
        onClick={handleLogout}
      >
        Sign Out
      </button>
    </div>
  );

  const SkeletonName = (
    <div className="flex items-center gap-2 animate-pulse">
      <div className="h-4 w-24 bg-gray-300 rounded" />
    </div>
  );

  const SkeletonAvatar = (
    <div className="w-10 h-10 rounded-full bg-gray-300 animate-pulse" />
  );

  if (type === "super_admin") {
    return (
      <header className="h-20 bg-[#E6E4F2] border-b px-4 sm:px-6 flex items-center justify-between min-w-0 relative">
        <div className="flex-1 min-w-0 max-w-md">
          <GlobalSearch mode="super_admin" />
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <NotificationBell />

          <div
            className="relative flex items-center gap-2 cursor-pointer"
            onClick={() => !isLoadingUser && setOpen((p) => !p)}
            ref={menuRef}
          >
            {isLoadingUser ? SkeletonAvatar : (
              <div className="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-medium">
                {initials}
              </div>
            )}

            {isLoadingUser ? SkeletonName : (
              <span className="hidden sm:block text-gray-700 font-medium">
                {name}
              </span>
            )}

            {!isLoadingUser && open && Dropdown}
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="h-16 bg-[#E6E4F2] px-4 sm:px-6 flex items-center justify-between min-w-0 relative">
      {isLoadingUser ? (
        <div className="h-4 w-32 bg-gray-300 rounded animate-pulse" />
      ) : (
        <h3 className="text-base sm:text-xl font-medium truncate">
          Hi, {name}
        </h3>
      )}

      <div className="flex-1 mx-4 min-w-0 max-w-md">
        <GlobalSearch mode="admin" />
      </div>

      <div className="flex items-center gap-4 shrink-0">
        <NotificationBell />

        <div className="relative" ref={menuRef}>
          <div
            className="cursor-pointer"
            onClick={() => !isLoadingUser && setOpen((p) => !p)}
          >
            {isLoadingUser ? SkeletonAvatar : (
             <Avatar size={40} />
            )}
          </div>

          {!isLoadingUser && open && Dropdown}
        </div>

      </div>
    </header>
  );
}
