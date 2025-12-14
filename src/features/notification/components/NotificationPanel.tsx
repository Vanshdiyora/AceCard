import { X } from "lucide-react";
import { useAppSelector, useAppDispatch } from "../../../app/hooks";
import { markAll } from "../slice";
import NotificationItem from "./NotificationItem";
import { useState } from "react";

const tabs = [
  { label: "All", value: "all" },
  { label: "Unread", value: "unread" },
  { label: "Assignments", value: "assignment" },
  { label: "Campaigns", value: "campaign" },
  { label: "CRM", value: "crm" },
  { label: "Credits", value: "credit" },
];

export default function NotificationPanel({ onClose }: any) {
  const dispatch = useAppDispatch();

  // ✅ SAFE fallback — NEVER undefined or null
  const notifications =
    useAppSelector((s: any) => s.notifications?.list || s.notfication?.list || []) ?? [];

  const [active, setActive] = useState("all");

  const filtered = notifications.filter((n: any) => {
    if (active === "all") return true;
    if (active === "unread") return !n.is_read;
    return n.category === active;
  });

  return (
    <div className="bg-white rounded-md shadow-xl border p-4 max-h-[450px] flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <h2 className="font-semibold text-lg">Notifications</h2>

        <button
          onClick={() => dispatch(markAll())}
          className="text-sm text-blue-600 hover:underline"
        >
          Mark All as Read
        </button>

        <X className="cursor-pointer" onClick={onClose} />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 text-sm mb-3 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.value}
            className={`px-3 py-1 rounded-full ${
              active === t.value
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600"
            }`}
            onClick={() => setActive(t.value)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2">
        {filtered.map((n: any) => (
          <NotificationItem key={n.id} item={n} />
        ))}

        {filtered.length === 0 && (
          <p className="text-center text-gray-500 py-5">No notifications</p>
        )}
      </div>
    </div>
  );
}
