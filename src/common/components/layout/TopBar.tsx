import { useState, useRef, useEffect } from "react";
import NotificationBell from "./NotificationBell"; 
// <-- Make sure path is correct

type TopbarProps = {
  username?: string;
  type: "admin" | "superadmin";
};

export default function Topbar({ username = "User", type }: TopbarProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  const Dropdown = (
    <div className="absolute right-0 mt-2 bg-white border shadow-lg rounded-lg w-40 z-50">
      <button
        className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
        onClick={logout}
      >
        Sign Out
      </button>
    </div>
  );

  // ---------------- SUPERADMIN TOPBAR ----------------
  if (type === "superadmin") {
    return (
      <header className="h-20 bg-white border-b px-6 flex items-center justify-between shadow-sm relative">
        {/* Search Box */}
        <input
          className="w-[420px] border rounded-lg px-4 py-2 text-sm shadow-sm"
          placeholder="Search vendors, reps, leads, campaigns..."
        />

        <div className="flex items-center gap-6">

          {/* 🔔 Notification Component Added */}
          <NotificationBell />

          {/* Avatar + Name */}
          <div
            className="relative flex items-center gap-2 cursor-pointer"
            onClick={() => setOpen((prev) => !prev)}
            ref={menuRef}
          >
            <div className="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-medium">
              SA
            </div>

            <span className="text-gray-700 font-medium">Super Admin</span>

            {open && Dropdown}
          </div>
        </div>
      </header>
    );
  }

  // ---------------- ADMIN (VENDOR) TOPBAR ----------------
  return (
    <header className="h-16 bg-white border-b px-6 flex items-center justify-between shadow-sm relative">
      <h3 className="text-xl font-medium">Hi, {username}</h3>

      <input
        className="w-96 border rounded-lg px-4 py-2 text-sm"
        placeholder="Search people, leads, campaigns..."
      />

      <div className="flex items-center gap-6">

        {/* 🔔 Notification Component Added */}
        <NotificationBell />

        {/* Avatar */}
        <div
          className="relative cursor-pointer"
          onClick={() => setOpen((prev) => !prev)}
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
