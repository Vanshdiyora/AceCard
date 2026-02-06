import { useEffect, useState } from "react";
import { useAppDispatch } from "../../../app/hooks";
import { updateSeats } from "../slice";
import type { VendorSeatsTarget } from "../types";

interface UpdateSeatsModalProps {
  vendor: VendorSeatsTarget | null;
  open: boolean;
  onClose: () => void;
  onSuccess?: (seats: number) => void;
}


export default function UpdateSeatsModal({
  vendor,
  open,
  onClose,
  onSuccess
}: UpdateSeatsModalProps) {
  const dispatch = useAppDispatch();
  const [seats, setSeats] = useState<string>("");

  useEffect(() => {
    if (vendor) {
      setSeats(String(vendor.seats_appointed));
    }
  }, [vendor]);

  const save = async () => {
    if (!vendor) return;

    const parsedSeats = Number(seats);
    if (!Number.isInteger(parsedSeats) || parsedSeats < 0) return;

    await dispatch(
      updateSeats({ id: vendor.id, seats: parsedSeats })
    ).unwrap();

    onClose();
    onSuccess?.(parsedSeats);

  };

  if (!open || !vendor) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-[420px] rounded-2xl shadow-xl">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">Update Seats</h2>
          <p className="text-xs text-gray-500">
            Change the number of seats assigned to this vendor
          </p>
        </div>

        <div className="px-6 py-5 space-y-3">
          <label className="text-sm font-medium">Seats Appointed</label>
          <input
            type="number"
            value={seats}
            onChange={(e) => setSeats(e.target.value)}
            className="border rounded-lg w-full px-3 py-2"
          />
        </div>

        <div className="px-6 py-4 border-t flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 border rounded-lg">
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
