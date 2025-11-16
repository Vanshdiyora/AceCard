import Modal from "../../../../common/ui/Modal";

interface ApproveProps {
  open: boolean;
  onClose: () => void;
  data: any; // salesperson info
  onApprove: () => void;
}

export default function ApproveSalespersonModal({
  open,
  onClose,
  data,
  onApprove,
}: ApproveProps) {
  if (!data) return null;

  return (
    <Modal open={open} onClose={onClose} width="550px">
      <h2 className="text-xl font-semibold mb-2">Approve Salesperson</h2>
      <p className="text-gray-600 mb-6">
        Confirm approval for <strong>{data.name}</strong>
      </p>

      {/* Info box */}
      <div className="space-y-1 text-sm border rounded-lg p-4 bg-gray-50 mb-4">
        <p><strong>Name:</strong> {data.name}</p>
        <p><strong>Email:</strong> {data.email}</p>
        <p><strong>Vendor:</strong> {data.vendor}</p>
        <p><strong>Role:</strong> {data.role}</p>
      </div>

      <div className="bg-green-50 text-green-700 text-sm p-3 rounded-lg mb-6">
        Upon approval, the salesperson will be granted access to the vendor
        dashboard and will be able to start capturing leads.
      </div>

      <div className="flex justify-end space-x-3">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
        >
          Cancel
        </button>

        <button
          onClick={onApprove}
          className="px-5 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700"
        >
          ✔ Approve
        </button>
      </div>
    </Modal>
  );
}
