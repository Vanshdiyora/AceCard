import { useEffect, useState } from "react";
import { useAppDispatch } from "../../../app/hooks";
import { updateSeats } from "../slice";
import type { VendorItem } from "../types";

interface UpdateSeatsModalProps {
  vendor: VendorItem | null;
  open: boolean;
  onClose: () => void;
}

export default function UpdateSeatsModal({
  vendor,
  open,
  onClose,
}: UpdateSeatsModalProps) {
  const dispatch = useAppDispatch();
  const [seats, setSeats] = useState<number>(0);

  useEffect(() => {
    if (vendor) setSeats(vendor.seats_appointed ?? 0);
  }, [vendor]);

  // 🔒 Disable background scroll
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const save = async () => {
    if (!vendor) return;

    await dispatch(updateSeats({ id: vendor.id, seats }));
    onClose();
  };

  if (!open || !vendor) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-[420px] rounded-2xl shadow-xl overflow-hidden flex flex-col">

        {/* Header */}
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">Update Seats</h2>
          <p className="text-xs text-gray-500">
            Change the number of seats assigned to this vendor
          </p>
        </div>

        {/* Body */}
        <div className="flex-1 px-6 py-5 space-y-3">
          <label className="text-sm font-medium text-gray-700">
            Seats Appointed
          </label>

          <input
            type="number"
            value={seats}
            onChange={(e) => setSeats(Number(e.target.value))}
            className="border rounded-lg w-full px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Enter number of seats"
          />

          <p className="text-xs text-gray-400">
            This controls how many users the vendor can onboard.
          </p>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t flex justify-end gap-3">
          <button
            className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            onClick={save}
          >
            Save Changes
          </button>
        </div>

      </div>
    </div>
  );
}
