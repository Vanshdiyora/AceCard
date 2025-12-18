import { X } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { markAll } from "../slice";
import NotificationItem from "./NotificationItem";
import { selectNotifications } from "../selectors";

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
  const notifications = useAppSelector(selectNotifications);
  const [activeTab, setActiveTab] = useState("all");

  const filtered = useMemo(() => {
    return notifications.filter((n) => {
      if (activeTab === "all") return true;
      if (activeTab === "unread") return !n.is_read;
      return n.category === activeTab;
    });
  }, [notifications, activeTab]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "auto";
  }, [open]);

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-40"
          onClick={onClose}
        />
      )}

      <div
        className={`fixed top-0 right-0 h-full w-[380px] bg-white/70 backdrop-blur-md shadow-xl z-50 transition-transform duration-300 
        ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center gap-4 p-4 border-b">
          <h2 className="font-bold">Notifications</h2>
          <button
            onClick={() => dispatch(markAll())}
            className="text-sm text-blue-600 ml-auto"
          >
            Mark all read
          </button>
          <X className="cursor-pointer" onClick={onClose} />
        </div>

        <div className="flex flex-wrap gap-2 p-3 border-b">
          {tabs.map((t) => (
            <button
              key={t.value}
              onClick={() => setActiveTab(t.value)}
              className={`px-3 py-1 rounded-full text-sm ${
                activeTab === t.value
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-4 space-y-3 overflow-y-auto h-[calc(100%-140px)]">
          {filtered.length === 0 && (
            <p className="text-center text-gray-500">No notifications</p>
          )}
          {filtered.map((n) => (
            <NotificationItem key={n.id} item={n} />
          ))}
        </div>
      </div>
    </>
  );
}
