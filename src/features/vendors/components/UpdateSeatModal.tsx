import { useEffect, useState } from "react";
import { useAppDispatch } from "../../../app/hooks";
import { updateSeats, fetchVendors } from "../slice";
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

  const save = async () => {
    if (!vendor) return;

    await dispatch(updateSeats({ id: vendor.id, seats }));
    dispatch(fetchVendors());
    onClose();
  };

  if (!open || !vendor) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-[400px] max-h-[80vh] rounded-xl shadow-lg flex flex-col">

        {/* Header */}
        <div className="p-5 border-b">
          <h2 className="text-xl font-semibold">Update Seats</h2>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          <label className="text-sm font-medium text-gray-700">Seats Appointed</label>

          <input
            type="number"
            value={seats}
            onChange={(e) => setSeats(Number(e.target.value))}
            className="border rounded-lg w-full p-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
            placeholder="Enter number of seats"
          />
        </div>

        {/* Footer */}
        <div className="p-4 border-t flex justify-end gap-2">
          <button className="px-4 py-2 border rounded" onClick={onClose}>
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-purple-600 text-white rounded"
            onClick={save}
          >
            Save
          </button>
        </div>

      </div>
    </div>
  );
}
