export default function SuspendMemberModal({
  open,
  name,
  onClose,
  onConfirm,
}: {
  open: boolean;
  name: string;
  onClose: () => void;
  onConfirm: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl w-96 shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Suspend Member</h2>

        <p className="text-gray-600">
          Are you sure you want to suspend <b>{name}</b>?
        </p>

        <div className="flex justify-end gap-2 mt-6">
          <button className="px-4 py-2 border rounded" onClick={onClose}>
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-red-600 text-white rounded"
            onClick={onConfirm}
          >
            Suspend
          </button>
        </div>
      </div>
    </div>
  );
}
