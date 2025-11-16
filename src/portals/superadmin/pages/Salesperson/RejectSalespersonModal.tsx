import { useState } from "react";
import Modal from "../../../../common/ui/Modal";

interface RejectProps {
  open: boolean;
  onClose: () => void;
  data: any;
  onReject: (reason: string) => void;
}

export default function RejectSalespersonModal({
  open,
  onClose,
  data,
  onReject,
}: RejectProps) {
  const [reason, setReason] = useState("");

  if (!data) return null;

  return (
    <Modal open={open} onClose={onClose} width="550px">
      <h2 className="text-xl font-semibold mb-2">Reject Salesperson</h2>

      <p className="text-gray-600 mb-6">
        Provide a reason for rejecting <strong>{data.name}</strong>
      </p>

      <textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Enter the reason for rejection..."
        className="w-full p-3 border rounded-lg h-28 mb-4"
      />

      <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg mb-6">
        The salesperson and their manager will be notified of this rejection via email.
      </div>

      <div className="flex justify-end space-x-3">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
        >
          Cancel
        </button>

        <button
          onClick={() => onReject(reason)}
          className="px-5 py-2 bg-red-600 text-white rounded-lg shadow hover:bg-red-700"
        >
          ✖ Reject
        </button>
      </div>
    </Modal>
  );
}
