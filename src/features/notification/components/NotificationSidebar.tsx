import { X } from "lucide-react";
import { useAppSelector, useAppDispatch } from "../../../app/hooks";
import { markAll } from "../slice";
import NotificationItem from "./NotificationItem";
import { useState, useEffect } from "react";
import { type Notification } from "../types";
const tabs = [
  { label: "All", value: "all" },
  { label: "Unread", value: "unread" },
  { label: "Assignments", value: "assignment" },
  { label: "Campaigns", value: "campaign" },
  { label: "CRM", value: "crm" },
  { label: "Credits", value: "credit" },
];

export default function NotificationSidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const dispatch = useAppDispatch();

  const notifications = (useAppSelector((s: any) =>
    s.notifications?.list || s.notfication?.list || []
  ) ?? []) as Notification[];

  const [activeTab, setActiveTab] = useState("all");

  const filtered = notifications.filter((n: Notification) => {
    if (activeTab === "all") return true;
    if (activeTab === "unread") return !n.is_read;
    return n.category === activeTab;
  });

  // Disable scroll when sidebar is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "auto";
  }, [open]);

  return (
    <>
      {/* BACKDROP */}
      {open && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          onClick={onClose}
        />
      )}

      {/* SIDEBAR PANEL */}
      <div
        className={`fixed top-0 right-0 h-full w-[380px] bg-white/70 backdrop-blur-md shadow-xl z-50 transition-transform duration-300 
        ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-bold">Notifications</h2>

          <button
            onClick={() => dispatch(markAll())}
            className="text-sm text-blue-600 hover:underline mr-auto ml-4"
          >
            Mark all read
          </button>

          <X className="cursor-pointer" onClick={onClose} />
        </div>

        {/* TABS */}
        <div className="flex flex-wrap gap-2 px-4 py-3 border-b">
          {tabs.map((t) => (
            <button
              key={t.value}
              onClick={() => setActiveTab(t.value)}
              className={`px-3 py-1 rounded-full text-sm
                  ${activeTab === t.value
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700"
                }`}
            >
              {t.label}
            </button>
          ))}
        </div>


        {/* NOTIFICATION LIST */}
        <div className="p-4 overflow-y-auto h-[calc(100%-140px)] space-y-3">
          {filtered.map((n) => (
            <NotificationItem key={n.id} item={n} />
          ))}

          {filtered.length === 0 && (
            <p className="text-center text-gray-500">No notifications</p>
          )}
        </div>
      </div>
    </>
  );
}
