import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import {
  markAll,
  clearArchiveError,
  archiveAllNotifications,
  fetchNotifications,
} from "../slice";
import NotificationItem from "./NotificationItem";
import { selectNotifications } from "../selectors";
import { useNotificationSocket } from "../hooks/useNotificationSocket";
import BrandLoader from "../../../common/ui/BrandLoader";

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
  const { archiveError, meta, loading } = useAppSelector(
    (s) => s.notifications
  );

  useNotificationSocket(token);

  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  /* Fetch first page when opened */
  useEffect(() => {
    if (open) {
      setPage(1);
      dispatch(fetchNotifications({ page: 1 }));
    }
  }, [open, dispatch]);

  /* Lock background scroll */
  useEffect(() => {
    if (open) {
      document.documentElement.style.overflow = "hidden";
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

  /* Auto-clear archive error */
  useEffect(() => {
    if (!archiveError) return;
    const timer = setTimeout(() => dispatch(clearArchiveError()), 10000);
    return () => clearTimeout(timer);
  }, [archiveError, dispatch]);

  const loadMore = async () => {
    if (loadingMore || loading) return;
    if (!meta?.has_next) return;

    setLoadingMore(true);
    const next = page + 1;

    await dispatch(fetchNotifications({ page: next }));
    setPage(next);

    setLoadingMore(false);
  };

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
          <button
            onClick={() => dispatch(archiveAllNotifications())}
            className="text-sm text-red-600"
          >
            Delete all
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

        <div
          className="p-4 space-y-3 overflow-y-auto h-[calc(100%-64px)]"
          onScroll={(e) => {
            const el = e.currentTarget;
            if (el.scrollTop + el.clientHeight >= el.scrollHeight - 40) {
              loadMore();
            }
          }}
        >
       {/* Initial loader */}
{loading && page === 1 && (
  <div className="flex items-center justify-center h-full">
    <BrandLoader />
  </div>
)}


          {/* Empty state */}
          {!loading && notifications.length === 0 && (
            <p className="text-center text-gray-500">No notifications</p>
          )}

          {/* List */}
          {notifications.map((n) => (
            <NotificationItem key={n.id} item={n} />
          ))}

          {/* Infinite loader */}
          {loadingMore && (
            <div className="flex justify-center py-2 text-xs text-gray-400">
              <BrandLoader/>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
