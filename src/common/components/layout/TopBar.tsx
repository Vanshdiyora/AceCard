import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NotificationBell from "./NotificationBell";
import GlobalSearch from "../../../features/globalSearch/components/GlobalSearch";
import { useAppDispatch } from "../../../app/hooks";
import { logout } from "../../../features/auth/slice";

type TopbarProps = {
  username?: string;
  type: "admin" | "super_admin";
};

export default function Topbar({ username = "User", type }: TopbarProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

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

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login", { replace: true });
  };

  const Dropdown = (
    <div className="absolute right-0 mt-2 bg-white border shadow-lg rounded-lg w-40 z-50">
      <button
        className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
        onClick={handleLogout}
      >
        Sign Out
      </button>
    </div>
  );

  if (type === "super_admin") {
    return (
      <header className="h-20 bg-[#E6E4F2] border-b px-4 sm:px-6 flex items-center justify-between min-w-0">
        <div className="flex-1 min-w-0 max-w-md">
          <GlobalSearch mode="super_admin" />
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <NotificationBell />

          <div
            className="relative flex items-center gap-2 cursor-pointer"
            onClick={() => setOpen(p => !p)}
            ref={menuRef}
          >
            <div className="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-medium">
              SA
            </div>

            <span className="hidden sm:block text-gray-700 font-medium">
              Super Admin
            </span>

            {open && Dropdown}
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="h-16 bg-[#E6E4F2] px-4 sm:px-6 flex items-center justify-between min-w-0">
      <h3 className="text-base sm:text-xl font-medium truncate">
        Hi, {username}
      </h3>

      <div className="flex-1 mx-4 min-w-0 max-w-md">
        <GlobalSearch mode="admin" />
      </div>

      <div className="flex items-center gap-4 shrink-0">
        <NotificationBell />

        <div
          className="relative cursor-pointer"
          onClick={() => setOpen(p => !p)}
          ref={menuRef}
        >
          <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
            A
          </div>

          {open && Dropdown}
        </div>
      </div>
    </header>
  );
}
