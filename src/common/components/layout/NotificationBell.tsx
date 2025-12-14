import { Bell } from "lucide-react";
import { useAppSelector } from "../../../app/hooks";
import { useState } from "react";
import NotificationSidebar from "../../../features/notification/components/NotificationSidebar";
import type { Notification } from "../../../features/notification/types";

export default function NotificationBell() {
  const [open, setOpen] = useState(false);

  const notifications =
    useAppSelector((s: any) => s.notifications?.list || s.notfication?.list || []) as Notification[];

  const unread = notifications.filter((n) => !n.is_read).length;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="relative p-2 hover:bg-gray-100 rounded-full"
      >
        <Bell className="w-6 h-6 text-gray-600" />

        {unread > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1 rounded-full">
            {unread}
          </span>
        )}
      </button>

      {/* Right Sidebar */}
      <NotificationSidebar open={open} onClose={() => setOpen(false)} />
    </>
  );
}
