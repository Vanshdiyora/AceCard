import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import ResultModal from "../../../common/ui/ResultModal";
import {
  fetchPaymentHistory,
  markVendorPaid,
  markVendorUnpaid,
} from "../slice";
import type { VendorPayment } from "../types";

const formatDate = (dateString?: string) => {
  if (!dateString) return "-";

  const date = new Date(dateString);

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default function MarkPaidOptionsModal({
  open,
  vendor,
  onClose,
}: {
  open: boolean;
  vendor: VendorPayment | null;
  onClose: () => void;
}) {
  console.log(vendor)
  const dispatch = useAppDispatch();
  const { history, loading } = useAppSelector(
    (state: any) => state.payments
  );

  const [selectedPaymentId, setSelectedPaymentId] =
    useState<number | null>(null);

  /* 🔥 Fetch history */
  useEffect(() => {
    if (open && vendor) {
      dispatch(fetchPaymentHistory(vendor.vendor_id));
      setSelectedPaymentId(null);
    }
  }, [open, vendor, dispatch]);

  if (!open || !vendor) return null;

  const hasHistory = history.length > 0;

  /* ---------------- MARK PAID ---------------- */
  const handleMarkPaid = async () => {
    try {
      if (hasHistory) {
        if (!selectedPaymentId) return;

        await dispatch(markVendorPaid(selectedPaymentId)).unwrap();
      } else {
        // initial phase (no history)
        await dispatch(markVendorPaid(vendor.id)).unwrap();
      }

      onClose();
    } catch (err) {
      console.error(err);
    }
  };
  console.log(selectedPaymentId)
  /* ---------------- MARK UNPAID ---------------- */
  const handleMarkUnpaid = async () => {
    try {
      if (hasHistory) {
        if (!selectedPaymentId) return;

        await dispatch(
          markVendorUnpaid({ payment_id: selectedPaymentId })
        ).unwrap();
      } else {
        await dispatch(
          markVendorUnpaid({ payment_id: vendor.id })
        ).unwrap();
      }

      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <ResultModal open={open} success message="" onClose={onClose}>
      <h3 className="text-lg font-semibold mb-4">
        Payment History – {vendor.vendor_name}
      </h3>

      {loading && (
        <p className="text-sm text-gray-500">
          Loading history...
        </p>
      )}

      {/* ---------------- NO HISTORY CASE ---------------- */}
      {!loading && !hasHistory && (
        <div className="p-4 bg-yellow-50 border rounded text-sm text-yellow-800">
          No payment history found.
          <br />
          You can directly mark this vendor as Paid or Unpaid.
        </div>
      )}

      {/* ---------------- HISTORY LIST ---------------- */}
    {hasHistory && (
  <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
    {history.map((payment: any) => {
      const amount = Number(payment.payment_amount_total ?? 0);

      return (
        <div
          key={payment.id}
          onClick={() => setSelectedPaymentId(payment.id)}
          className={`rounded-xl border p-4 cursor-pointer transition-all
            ${
              selectedPaymentId === payment.id
                ? "border-green-500 bg-green-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
        >
          {/* Top Row */}
          <div className="flex justify-between items-center mb-1">
            <div className="font-semibold text-gray-900">
              ₹{amount.toLocaleString("en-IN")}
            </div>

            <StatusBadge status={payment.status} />
          </div>

          {/* Subject */}
          <div className="text-sm text-gray-600 mb-1">
            {payment.subject || "Regular Payment"}
          </div>

          {/* Period */}
          <div className="text-xs text-gray-400">
            {formatDate(payment.subscription_start_date)} →{" "}
            {formatDate(payment.subscription_end_date)}
          </div>
        </div>
      );
    })}
  </div>
)}

      {/* ---------------- ACTION BUTTONS ---------------- */}
      <div className="mt-6 flex justify-end gap-3">
        <button
          className="px-4 py-2 text-sm rounded border"
          onClick={onClose}
        >
          Cancel
        </button>

        <button
          disabled={hasHistory && !selectedPaymentId}
          className="px-4 py-2 text-sm rounded bg-red-600 text-white disabled:opacity-50"
          onClick={handleMarkUnpaid}
        >
          Mark as Unpaid
        </button>

        <button
          disabled={hasHistory && !selectedPaymentId}
          className="px-4 py-2 text-sm rounded bg-green-600 text-white disabled:opacity-50"
          onClick={handleMarkPaid}
        >
          Mark as Paid
        </button>
      </div>
    </ResultModal>
  );
}

function StatusBadge({ status }: { status?: string }) {
  const normalized = status?.toUpperCase();

  const styles: Record<string, string> = {
    PAID: "bg-green-100 text-green-700",
    PENDING: "bg-yellow-100 text-yellow-700",
    "NOT PAID": "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium ${
        styles[normalized || ""] || "bg-gray-100 text-gray-600"
      }`}
    >
      {status}
    </span>
  );
}