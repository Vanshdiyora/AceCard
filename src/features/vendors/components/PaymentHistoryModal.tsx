import { X } from "lucide-react";
import BrandLoader from "../../../common/ui/BrandLoader";
import { useEffect, useMemo, useRef } from "react";
type Props = {
    open: boolean;
    loading: boolean;
    history: any[];
    hasNext?: boolean;
    onLoadMore?: () => void;
    onClose: () => void;
};

export default function PaymentHistoryModal({
    open,
    loading,
    history,
    hasNext = false,
    onLoadMore,
    onClose,
}: Props) {
    const listRef = useRef<HTMLDivElement | null>(null);
    const sentinelRef = useRef<HTMLDivElement | null>(null);

    const sortedHistory = useMemo(() => {
        const toTimestamp = (value?: string) => {
            if (!value) return 0;
            const t = new Date(value).getTime();
            return Number.isNaN(t) ? 0 : t;
        };

        return [...(history || [])].sort((a, b) => {
            const aTime = toTimestamp(a?.payment_date || a?.created_at);
            const bTime = toTimestamp(b?.payment_date || b?.created_at);
            if (bTime !== aTime) return bTime - aTime;
            return Number(b?.id || 0) - Number(a?.id || 0);
        });
    }, [history]);

    useEffect(() => {
        if (!open) return;

        const originalOverflow = document.body.style.overflow;
        const originalPadding = document.body.style.paddingRight;

        document.body.style.overflow = "hidden";
        document.body.style.paddingRight = "15px"; // prevents layout shift

        return () => {
            document.body.style.overflow = originalOverflow;
            document.body.style.paddingRight = originalPadding;
        };
    }, [open]);

    useEffect(() => {
        const root = listRef.current;
        const target = sentinelRef.current;

        if (!open || !root || !target || !onLoadMore) return;

        const observer = new IntersectionObserver(
            (entries) => {
                const entry = entries[0];
                if (!entry?.isIntersecting) return;
                if (loading || !hasNext) return;
                onLoadMore();
            },
            {
                root,
                rootMargin: "0px 0px 40px 0px",
                threshold: 0.1,
            }
        );

        observer.observe(target);

        return () => observer.disconnect();
    }, [open, loading, hasNext, onLoadMore]);

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-[9999] bg-slate-900/45 backdrop-blur-sm flex items-center justify-center p-4"
            onWheel={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
        >
            <div
                className="
      bg-white
      w-full
      max-w-4xl
      rounded-2xl
      shadow-2xl
      overflow-hidden
      border border-slate-200
      overscroll-contain
    "
            >
                {/* ---------- Header ---------- */}
                <div className="flex items-center justify-between px-6 py-5 border-b">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">
                            Payment History
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Latest payments appear first
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg hover:bg-slate-100"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* ---------- Content ---------- */}
                <div
                    ref={listRef}
                    className="max-h-[70vh] overflow-y-auto px-6 py-4 space-y-3 bg-slate-50/60 overscroll-contain overscroll-y-contain"
                >

                    {sortedHistory.length === 0 && !loading && (
                        <div className="text-center text-sm text-gray-500 py-12">
                            No payment records found
                        </div>
                    )}

                    {sortedHistory.map((item, index) => (
                        <div
                            key={`${item.id ?? "history"}-${index}`}
                            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition"
                        >
                            <div className="grid grid-cols-2 md:grid-cols-6 gap-4 items-start md:items-center">

                                <Info
                                    label="Amount"
                                    value={`₹${Number(item.payment_amount_total ?? 0).toLocaleString("en-IN")}`}
                                    bold
                                />

                                <Info label="Seats" value={item.seats ?? "-"} />
                                <Info label="Subject" value={item.subject || "-"} />
                                <Info
                                    label="Period"
                                    value={
                                        <>
                                            <div>
                                                {item.subscription_start_date
                                                    ? new Date(item.subscription_start_date).toLocaleDateString("en-IN")
                                                    : "-"}
                                            </div>
                                            <div className="text-gray-400">to</div>
                                            <div>
                                                {item.subscription_end_date
                                                    ? new Date(item.subscription_end_date).toLocaleDateString("en-IN")
                                                    : "-"}
                                            </div>
                                        </>
                                    }
                                />

                                <Info
                                    label="Created"
                                    value={
                                        item.created_at
                                            ? new Date(item.created_at).toLocaleDateString("en-IN")
                                            : "-"
                                    }
                                />

                                <div className="flex justify-end md:justify-end col-span-2 md:col-span-1">
                                    <StatusBadge badge={item.status?.toUpperCase()} />
                                </div>
                            </div>
                        </div>
                    ))}

                    {loading && (
                        <div className="py-2">
                            <BrandLoader message="Loading more payments..." />
                        </div>
                    )}

                    <div ref={sentinelRef} className="h-1" />
                </div>
            </div>
        </div>
    );
}

/* ---------- UI helpers ---------- */

function Info({
    label,
    value,
    bold,
}: {
    label: string;
    value: any;
    bold?: boolean;
}) {
    return (
        <div className="text-sm min-w-0">
            <p className="text-[11px] uppercase tracking-wide text-slate-400 mb-1">{label}</p>
            <div className={bold ? "font-semibold text-slate-900 break-words" : "text-slate-700 break-words"}>
                {value}
            </div>
        </div>
    );
}

function StatusBadge({ badge }: { badge: string }) {
    const normalized = (badge || "")
        .replace(/_/g, " ")
        .toUpperCase();

    const uiBadge = normalized === "NOT PAID" ? "PENDING" : normalized;

    const styles: Record<string, string> = {
        PAID: "bg-green-100 text-green-700",
        PENDING: "bg-yellow-100 text-yellow-700",
        OVERDUE: "bg-orange-100 text-orange-700",
    };

    return (
        <span
            className={`px-4 py-1.5 rounded-full text-xs font-semibold ${styles[uiBadge] || "bg-gray-100 text-gray-600"
                }`}
        >
            {uiBadge}
        </span>
    );
}
