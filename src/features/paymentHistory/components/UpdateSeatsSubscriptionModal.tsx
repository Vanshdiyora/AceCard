import { useEffect, useState } from "react";
import BlockingLoader from "../../../common/ui/BlockingLoader";

type Props = {
  open: boolean;
  vendor: {
    vendor_id: number;
    seats: number;
    price_per_card: number;
    payment_terms: string;
  } | null;
  onClose: () => void;
  onSubmit: (seats: number) => Promise<void>;
};

export default function UpdateSeatsSubscriptionModal({
  open,
  vendor,
  onClose,
  onSubmit,
}: Props) {
  const [seats, setSeats] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (vendor) setSeats(vendor.seats);
  }, [vendor]);

  if (!open || !vendor) return null;

  const handleSave = async () => {
    try {
      setLoading(true);
      await onSubmit(seats);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <BlockingLoader show={loading} />

      <div className="bg-white rounded-xl w-[420px] p-6">
        <h3 className="text-lg font-semibold mb-4">Update Seats</h3>

        <label className="block text-sm font-medium mb-1">
          Number of seats
        </label>
        <input
          type="number"
          min={1}
          value={seats}
          onChange={(e) => setSeats(+e.target.value)}
          className="w-full border rounded px-3 py-2 mb-6"
        />

        <div className="flex justify-end gap-3">
          <button
            className="px-4 py-2 rounded border"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 rounded bg-black text-white"
            onClick={handleSave}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
