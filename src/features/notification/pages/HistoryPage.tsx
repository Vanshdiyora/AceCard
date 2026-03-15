import { useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { fetchSentNotifications, resetSentNotifications } from "../slice";
import { Search, ArrowLeft, X, Bell, Users, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";

/* ── Detail Modal ──────────────────────────────────────── */
function NotificationDetailModal({
  notification,
  onClose,
}: {
  notification: any;
  onClose: () => void;
}) {
  if (!notification) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-slide-from-bottom"
        style={{ maxHeight: "85vh", display: "flex", flexDirection: "column" }}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-9 w-9 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
              <Bell size={16} className="text-purple-600" />
            </div>
            <h2 className="font-semibold text-gray-900 text-base leading-snug truncate">
              {notification.message_title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 flex-shrink-0 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-5">
          {/* Message */}
          <div>
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              Message
            </span>
            <div
              className="mt-2 text-sm text-gray-700 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: notification.message_body }}
            />
          </div>

          {/* Sent To */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Users size={13} className="text-gray-400" />
              <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                Sent To ({notification.sent_to?.length ?? 0})
              </span>
            </div>
            <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto pr-1">
              {(notification.sent_to ?? []).map((v: string) => (
                <span
                  key={v}
                  className="text-xs bg-purple-50 text-purple-700 border border-purple-100 px-2.5 py-1 rounded-full"
                >
                  {v}
                </span>
              ))}
            </div>
          </div>

          {/* Sent At */}
          <div className="flex items-center gap-2 pt-1 border-t border-gray-100">
            <Clock size={13} className="text-gray-400" />
            <span className="text-xs text-gray-400">
              Sent at{" "}
              <span className="text-gray-600 font-medium">
                {new Date(notification.created_at).toLocaleString()}
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

/* ── Main Page ─────────────────────────────────────────── */
export default function NotificationHistoryPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const notifications = useAppSelector((s) => s.notifications.sentList);
  const loading = useAppSelector((s) => s.notifications.sentLoading);
  const meta = useAppSelector((s) => s.notifications.sentMeta);

  const scrollRef = useRef<HTMLDivElement>(null);
  const loadingLock = useRef(false);
  const loadingRef = useRef(false);
  const metaRef = useRef(meta);
  const searchRef = useRef("");

  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<any | null>(null);
  const isFirstRender = useRef(true);

  /* ---------- KEEP REFS IN SYNC ---------- */
  useEffect(() => {
    loadingRef.current = loading;
    if (!loading) loadingLock.current = false;
  }, [loading]);

  useEffect(() => {
    metaRef.current = meta;
  }, [meta]);

  useEffect(() => {
    searchRef.current = search;
  }, [search]);

  /* ---------- INITIAL FETCH ---------- */
  useEffect(() => {
    dispatch(resetSentNotifications());
    dispatch(fetchSentNotifications({ page: 1, page_size: 10, search: "" }));
  }, [dispatch]);

  /* ---------- SEARCH FETCH ---------- */
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const t = setTimeout(() => {
      dispatch(resetSentNotifications());
      dispatch(fetchSentNotifications({ page: 1, page_size: 10, search }));
    }, 400);
    return () => clearTimeout(t);
  }, [search]);
  useEffect(() => {
    const el = scrollRef.current;
    const currentMeta = metaRef.current;

    if (!el) return;

    const notScrollable = el.scrollHeight <= el.clientHeight;

    if (
      notScrollable &&
      currentMeta?.has_next &&
      !loadingRef.current &&
      !loadingLock.current &&
      currentMeta.page === 1
    ) {
      loadingLock.current = true;

      dispatch(
        fetchSentNotifications({
          page: currentMeta.page + 1,
          page_size: currentMeta.page_size ?? 10,
          search: searchRef.current,
        })
      );
    }
  }, [meta?.page]);
  useEffect(() => {
    const onScroll = () => {
      const currentMeta = metaRef.current;

      if (
        loadingRef.current ||
        loadingLock.current ||
        !currentMeta?.has_next
      )
        return;

      const scrollPosition =
        window.innerHeight + document.documentElement.scrollTop;

      const pageHeight = document.documentElement.offsetHeight;

      if (scrollPosition >= pageHeight - 200) {
        loadingLock.current = true;

        dispatch(
          fetchSentNotifications({
            page: (currentMeta.page ?? 1) + 1,
            page_size: currentMeta.page_size ?? 10,
            search: searchRef.current,
          })
        );
      }
    };

    window.addEventListener("scroll", onScroll);

    return () => window.removeEventListener("scroll", onScroll);
  }, [dispatch]);

  /* Strip HTML tags for preview snippet */
  const stripHtml = (html: string) => {
    const div = document.createElement("div");
    div.innerHTML = html;
    return div.textContent || div.innerText || "";
  };

  return (
    <div className="p-6 h-[calc(100dvh-var(--app-header-height))] flex flex-col overflow-hidden">

      {/* Top bar */}
      <div className="flex items-center gap-3 mb-5 flex-shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-3xl font-bold text-gray-800">Notification History</h1>
      </div>

      {/* Search */}
      <div className="mb-4 w-[400px] flex-shrink-0">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search notifications..."
            className="w-full border rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      {/* List */}
      <div
        ref={scrollRef}
        className="flex-1 space-y-3 pr-2 min-h-0"
      >
        {(notifications ?? []).map((n) => (
          <button
            key={n.id}
            onClick={() => setSelected(n)}
            className="w-full text-left border border-gray-200 rounded-xl p-4 bg-white shadow-sm hover:shadow-md hover:border-purple-200 transition-all group"
          >
            <div className="flex items-start justify-between gap-3">

              {/* Left: icon + content */}
              <div className="flex items-start gap-3 min-w-0">
                <div className="h-8 w-8 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-purple-100 transition-colors">
                  <Bell size={14} className="text-purple-500" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-gray-900 text-sm truncate">
                    {n.message_title}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">
                    {stripHtml(n.message_body).slice(0, 120)}
                    {stripHtml(n.message_body).length > 120 ? "…" : ""}
                  </div>
                </div>
              </div>

              {/* Right: time */}
              <div className="flex-shrink-0 text-right">
                <span className="text-[11px] text-gray-400 whitespace-nowrap">
                  {new Date(n.created_at).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
                <div className="text-[11px] text-gray-400 whitespace-nowrap">
                  {new Date(n.created_at).toLocaleTimeString(undefined, {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </div>
          </button>
        ))}

        {loading && notifications.length > 0 && (
          <div className="flex justify-center py-4 text-gray-400 text-sm">
            Loading more...
          </div>
        )}

        {loading && notifications.length === 0 && (
          <div className="flex justify-center py-12 text-gray-400 text-sm">
            Loading...
          </div>
        )}

        {!loading && notifications.length === 0 && (
          <div className="text-center text-gray-400 py-12">
            <Bell size={32} className="mx-auto mb-2 opacity-30" />
            <div>No notifications found</div>
          </div>
        )}
      </div>

      {/* Detail modal */}
      <NotificationDetailModal
        notification={selected}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}