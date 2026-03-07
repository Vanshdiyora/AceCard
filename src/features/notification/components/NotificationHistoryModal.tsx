import { useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";

type NotificationItem = {
    id: number;
    message_title: string;
    message_body: string;
    created_at: string;
    sent_to: string[];
};

interface Props {
    open: boolean;
    notifications: NotificationItem[];
    loading?: boolean;
    hasNext?: boolean;
    onLoadMore?: () => void;
    onSearch?: (value: string) => void;
    onClose: () => void;
    title?: string;
}

export default function NotificationHistoryModal({
    open,
    notifications,
    loading = false,
    hasNext = false,
    onLoadMore,
    onSearch,
    onClose,
    title = "Notification History",
}: Props) {

    const scrollRef = useRef<HTMLDivElement>(null);
    const loadingLock = useRef(false);
    const [search, setSearch] = useState("");

    useEffect(() => {
        if (!open) return;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "";
        };
    }, [open]);

    /* Debounced search */
    useEffect(() => {
        const t = setTimeout(() => {
            onSearch?.(search);
        }, 400);

        return () => clearTimeout(t);
    }, [search]);
    const skeletons = Array.from({ length: 2 });
    const handleScroll = () => {
        if (!scrollRef.current || loading || !hasNext || loadingLock.current) return;

        const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;

        if (scrollTop + clientHeight >= scrollHeight - 80) {
            loadingLock.current = true;
            onLoadMore?.();
        }
    };

    useEffect(() => {
        if (!loading) loadingLock.current = false;
    }, [loading]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">

            <div className="bg-white w-[720px] max-h-[80vh] rounded-2xl shadow-xl flex flex-col overflow-hidden">

                {/* Header */}
                <div className="px-5 py-4 border-b flex justify-between items-center bg-white">
                    <h2 className="text-lg font-semibold text-gray-800">{title}</h2>

                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-800 text-xl"
                    >
                        ×
                    </button>
                </div>

                {/* Search */}
                <div className="px-5 py-3 border-b">
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

                {/* Body */}
                <div
                    ref={scrollRef}
                    onScroll={handleScroll}
                    className="flex-1 overflow-y-auto p-5 space-y-4"
                >

                    {(notifications ?? []).map((n) => (
                        <div
                            key={n.id}
                            className="border border-gray-200 rounded-xl p-4 hover:shadow-sm transition"
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

                                <div className="flex flex-wrap gap-2 mt-1">
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

                    {loading && notifications.length === 0 &&
                        skeletons.map((_, i) => (
                            <div
                                key={i}
                                className="border border-gray-200 rounded-xl p-4 animate-pulse"
                            >
                                <div className="h-3 w-16 bg-gray-200 rounded mb-2"></div>
                                <div className="h-4 w-48 bg-gray-200 rounded mb-4"></div>

                                <div className="h-3 w-20 bg-gray-200 rounded mb-2"></div>
                                <div className="h-3 w-full bg-gray-200 rounded mb-1"></div>
                                <div className="h-3 w-5/6 bg-gray-200 rounded mb-4"></div>

                                <div className="h-3 w-20 bg-gray-200 rounded mb-2"></div>
                                <div className="flex gap-2">
                                    <div className="h-5 w-20 bg-gray-200 rounded-full"></div>
                                    <div className="h-5 w-16 bg-gray-200 rounded-full"></div>
                                </div>

                                <div className="flex justify-between mt-4">
                                    <div className="h-3 w-16 bg-gray-200 rounded"></div>
                                    <div className="h-3 w-24 bg-gray-200 rounded"></div>
                                </div>
                            </div>
                        ))}
                    {!loading && notifications.length === 0 && (
                        <div className="text-center text-gray-400 py-8">
                            No notifications found
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}