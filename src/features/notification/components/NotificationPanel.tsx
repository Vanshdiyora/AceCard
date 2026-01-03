import { X } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { markAll } from "../slice";
import NotificationItem from "./NotificationItem";

export default function NotificationPanel({ onClose }: any) {
  const dispatch = useAppDispatch();

  const notifications =
    useAppSelector((s: any) => s.notifications?.list ?? []);

  return (
    <div className="bg-white rounded-md shadow-xl border p-4 max-h-[450px] flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <h2 className="font-semibold text-lg">Notifications</h2>

        <button
          onClick={() => dispatch(markAll())}
          className="text-sm text-blue-600 hover:underline"
        >
          Mark all as read
        </button>

        <X className="cursor-pointer" onClick={onClose} />
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto space-y-2">
        {notifications.length === 0 && (
          <p className="text-center text-gray-500 py-5">
            No notifications
          </p>
        )}

        {notifications.map((n: any) => (
          <NotificationItem key={n.id} item={n} />
        ))}
      </div>
    </div>
  );
}
