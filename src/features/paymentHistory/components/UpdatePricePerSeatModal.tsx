import { useEffect, useState } from "react";
import { useAppDispatch } from "../../../app/hooks";
import { updateSubscription } from "../slice";
import type { VendorPayment } from "../types";

interface UpdatePricePerSeatModalProps {
  vendor: VendorPayment | null;
  open: boolean;
  onClose: () => void;
  onSuccess: (newPrice: number) => void;
}

export default function UpdatePricePerSeatModal({
  vendor,
  open,
  onClose,
  onSuccess,
}: UpdatePricePerSeatModalProps) {
  const dispatch = useAppDispatch();
  const [price, setPrice] = useState("");

  useEffect(() => {
    if (vendor) {
      setPrice(String(vendor.price_per_card));
    }
  }, [vendor]);

  const save = async () => {
    if (!vendor) return;

    const parsedPrice = Number(price);

    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
      return;
    }

    try {
      await dispatch(
        updateSubscription({
          vendor_id: vendor.vendor_id,
          payment_terms: vendor.payment_terms,
          seats: vendor.seats,
          price_per_card: parsedPrice,
          payment_amount_total: vendor.seats * parsedPrice,
        })
      ).unwrap();

      // 🔥 IMPORTANT: notify parent so Redux can update locally
      onSuccess(parsedPrice);
      onClose();
    } catch (err) {
      console.error("Update price failed", err);
    }
  };

  if (!open || !vendor) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-[420px] rounded-2xl shadow-xl">

        {/* Header */}
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">Update Price per Seat</h2>
          <p className="text-xs text-gray-500">
            Change the price charged for each seat
          </p>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-3">
          <label className="text-sm font-medium">Price per Seat</label>
          <input
            type="number"
            inputMode="decimal"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="border rounded-lg w-full px-3 py-2"
            placeholder="Enter price"
          />
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={save}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
