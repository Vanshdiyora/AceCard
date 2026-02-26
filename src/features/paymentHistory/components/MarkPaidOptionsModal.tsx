import { useEffect, useState } from "react";
import type { VendorPayment } from "../types";
import ResultModal from "../../../common/ui/ResultModal";

export default function MarkPaidOptionsModal({
  open,
  vendor,
  onConfirmPaid,
  onClose,
}: {
  open: boolean;
  vendor: VendorPayment | null;
  onConfirmPaid: (payload: {
    seats: number | "";
    price_per_card: number | "";
    payment_amount_total: number | "";
  }) => void;
  onClose: () => void;
}) {
  const [seats, setSeats] = useState<number | "">("");
  const [price, setPrice] = useState<number | "">("");

  useEffect(() => {
    if (vendor) {
      setSeats(vendor.seats ?? "");
      setPrice(vendor.price_per_card ?? "");
    }
  }, [vendor]);

  if (!open || !vendor) return null;

  // 🔢 multiplier based on payment terms
const getMultiplier = (term?: string) => {
  switch (term) {
    case "monthly":
      return 1;
    case "quarterly":
      return 3;
    case "semi_annually":
      return 6;
    case "annually":
      return 12;
    default:
      return 1;
  }
};

const multiplier = getMultiplier(vendor.payment_terms);

  // 💰 safely calculated total
  const total: number | "" =
    typeof seats === "number" && typeof price === "number"
      ? seats * price * multiplier
      : "";

  return (
    <ResultModal open={open} success message="" onClose={onClose}>
      <h3 className="text-lg font-semibold mb-3">
        Mark {vendor.vendor_name} as Paid
      </h3>

      <div className="space-y-4 text-left">
        {/* Seats */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Seats
          </label>
          <input
            type="number"
            min={1}
            value={seats}
            onChange={(e) =>
              setSeats(e.target.value === "" ? "" : Number(e.target.value))
            }
            className="w-full border rounded px-3 py-2 text-sm"
          />
        </div>

        {/* Price */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Price per Seat (₹)
          </label>
          <input
            type="number"
            min={0}
            value={price}
            onChange={(e) =>
              setPrice(e.target.value === "" ? "" : Number(e.target.value))
            }
            className="w-full border rounded px-3 py-2 text-sm"
          />
        </div>

        {/* Total */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Total Amount (₹)
          </label>
          <input
            type="text"
            readOnly
            value={total === "" ? "" : `₹ ${total}`}
            className="w-full border rounded px-3 py-2 text-sm bg-gray-100 cursor-not-allowed"
          />

          {vendor.payment_terms === "annually" && total !== "" && (
            <p className="text-xs text-gray-500 mt-1">
              Calculated as yearly payment (×12)
            </p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="mt-5 flex justify-end gap-2">
        <button
          className="px-4 py-2 text-sm rounded border"
          onClick={onClose}
        >
          Cancel
        </button>

        <button
          disabled={total === ""}
          className="px-4 py-2 text-sm rounded bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50"
          onClick={() =>
            onConfirmPaid({
              seats,
              price_per_card: price,
              payment_amount_total: total,
            })
          }
        >
          Save & Mark as Paid
        </button>
      </div>
    </ResultModal>
  );
}
