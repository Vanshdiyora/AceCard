import { useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { fetchSentNotifications, resetSentNotifications } from "../slice";
import { Search } from "lucide-react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
export default function NotificationHistoryPage() {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const notifications = useAppSelector((s) => s.notifications.sentList);
    const loading = useAppSelector((s) => s.notifications.sentLoading);
    const meta = useAppSelector((s) => s.notifications.sentMeta);

    const scrollRef = useRef<HTMLDivElement>(null);
    const loadingLock = useRef(false);

    const [search, setSearch] = useState("");

    useEffect(() => {
        dispatch(resetSentNotifications());

        dispatch(
            fetchSentNotifications({
                page: 1,
                page_size: 10,
                search: "",
            })
        );
    }, [dispatch]);

    /* Debounced Search */
    useEffect(() => {
        const t = setTimeout(() => {
            dispatch(resetSentNotifications());

            dispatch(
                fetchSentNotifications({
                    page: 1,
                    page_size: 10,
                    search,
                })
            );
        }, 400);

        return () => clearTimeout(t);
    }, [search]);

    const handleScroll = () => {
        const el = scrollRef.current;
        if (!el || loading || !meta?.has_next || loadingLock.current) return;

        const { scrollTop, scrollHeight, clientHeight } = el;

        const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);

        if (distanceFromBottom < 120) {
            loadingLock.current = true;
            const nextPage = (meta?.page ?? 1) + 1;
            dispatch(
                fetchSentNotifications({
                    page: nextPage,
                    page_size: meta?.page_size ?? 10,
                    search,
                })
            );
        }
    };
    useEffect(() => {
        if (!loading) {
            loadingLock.current = false;
        }
    }, [notifications]);

    return (
        <div className="p-6 h-[calc(100dvh-var(--app-header-height))] flex flex-col">

            <div className="flex items-center gap-3 mb-5">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 rounded-lg"
                >
                    <ArrowLeft size={20} />
                </button>

                <h1 className="text-3xl font-bold text-gray-800">
                    Notification History
                </h1>
            </div>

            {/* Search */}
            <div className="mb-4 w-[400px]">
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
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto space-y-4 pr-2"
                style={{ minHeight: 0, maxHeight: "70vh" }}
            >
                {(notifications ?? []).map((n) => (
                    <div
                        key={n.id}
                        className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm"
                    >
                        <div className="mb-2">
                            <span className="text-xs text-gray-500 uppercase">Title</span>
                            <div className="font-semibold">{n.message_title}</div>
                        </div>

                        <div className="mb-3">
                            <span className="text-xs text-gray-500 uppercase">Message</span>
                            <div
                                className="text-sm text-gray-600 mt-1"
                                dangerouslySetInnerHTML={{ __html: n.message_body }}
                            />
                        </div>

                        <div className="mb-3">
                            <span className="text-xs text-gray-500 uppercase">Sent To</span>

                            <div className="flex flex-wrap gap-2 mt-1 max-h-24 overflow-y-auto pr-1">
                                {n.sent_to.map((v) => (
                                    <span
                                        key={v}
                                        className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full"
                                    >
                                        {v}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-between text-xs text-gray-400">
                            <span>Sent At</span>
                            <span>{new Date(n.created_at).toLocaleString()}</span>
                        </div>
                    </div>
                ))}
                {loading && notifications.length > 0 && (
                    <div className="flex justify-center py-4 text-gray-400">
                        Loading more...
                    </div>
                )}
                {!loading && notifications.length === 0 && (
                    <div className="text-center text-gray-400 py-8">
                        No notifications found
                    </div>
                )}
            </div>
        </div>
    );
}