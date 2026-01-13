import { X } from "lucide-react";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { markAll } from "../slice";
import NotificationItem from "./NotificationItem";
import { selectNotifications } from "../selectors";
import { useNotificationSocket } from "../hooks/useNotificationSocket";
import { clearArchiveError } from "../slice";

export default function NotificationSidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const dispatch = useAppDispatch();
  const notifications = useAppSelector(selectNotifications);
  const token = useAppSelector((s) => s.auth.token);
  useNotificationSocket(token);
  const { archiveError } = useAppSelector((s) => s.notifications);

  useEffect(() => {
    if (open) {
      document.documentElement.style.overflow = "hidden"; // html
      document.body.style.overflow = "hidden";
    } else {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    }

    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!archiveError) return;

    const timer = setTimeout(() => {
      dispatch(clearArchiveError());
    }, 10000); // 10 second

    return () => clearTimeout(timer);
  }, [archiveError, dispatch]);


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
            Mark all as read
          </button>

          <X className="cursor-pointer" onClick={onClose} />
        </div>

        {archiveError && (
          <div className="px-4">

            <div className="w-[60%] px-4 py-2 text-sm text-red-600 bg-red-50 border rounded-sm border-red-200">
              {archiveError}
            </div>
          </div>
        )}

        <div className="p-4 space-y-3 overflow-y-auto h-[calc(100%-64px)]">
          {notifications.length === 0 && (
            <p className="text-center text-gray-500">
              No notifications
            </p>
          )}

          {notifications.map((n) => (
            <NotificationItem key={n.id} item={n} />
          ))}
        </div>
      </div>
    </>
  );
}
