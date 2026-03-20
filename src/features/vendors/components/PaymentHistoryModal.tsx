import { X } from "lucide-react";
import BlockingLoader from "../../../common/ui/BlockingLoader";
import { useEffect } from "react";
type Props = {
    open: boolean;
    loading: boolean;
    history: any[];
    onClose: () => void;
};

export default function PaymentHistoryModal({
    open,
    loading,
    history,
    onClose,
}: Props) {
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

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-sm flex items-center justify-center"
            onWheel={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
        >
            <div
                className="
      bg-white
      w-full
      max-w-3xl
      rounded-2xl
      shadow-2xl
      overflow-hidden
      overscroll-contain   /* ✅ ADD THIS */
    "
            >
                {/* ---------- Header ---------- */}
                <div className="flex items-center justify-between px-6 py-5 border-b">
                    <h2 className="text-lg font-semibold text-gray-900">
                        Payment History
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-lg hover:bg-gray-100"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* ---------- Content ---------- */}
                <div className="max-h-[70vh] overflow-y-auto px-6 py-4 space-y-4 overscroll-contain overscroll-y-contain">

                    {history.length === 0 && !loading && (
                        <div className="text-center text-sm text-gray-500 py-12">
                            No payment records found
                        </div>
                    )}

                    {history.map((item) => (
                        <div
                            key={item.id}
                            className="rounded-xl border border-gray-100 bg-gray-50/40 p-4 hover:bg-gray-50 transition"
                        >
                            <div className="grid grid-cols-6 gap-4 items-center">

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
                                            <div className="text-gray-400">→</div>
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

                                <div className="flex justify-end">
                                    <StatusBadge badge={item.status?.toUpperCase()} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <BlockingLoader show={loading} />
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
        <div className="text-sm">
            <p className="text-xs text-gray-400 mb-1">{label}</p>
            <div className={bold ? "font-semibold text-gray-900" : "text-gray-700"}>
                {value}
            </div>
        </div>
    );
}

function StatusBadge({ badge }: { badge: string }) {
    const styles: Record<string, string> = {
        PAID: "bg-green-100 text-green-700",
        "NOT PAID": "bg-red-100 text-red-700",
        OVERDUE: "bg-orange-100 text-orange-700",
    };

    return (
        <span
            className={`px-4 py-1.5 rounded-full text-xs font-semibold ${styles[badge] || "bg-gray-100 text-gray-600"
                }`}
        >
            {badge}
        </span>
    );
}
