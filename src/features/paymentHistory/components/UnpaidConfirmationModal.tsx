type Props = {
  open: boolean;
  vendorName?: string;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function UnpaidConfirmationModal({
  open,
  vendorName,
  loading,
  onCancel,
  onConfirm,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-[420px] p-6">
        <h3 className="text-lg font-semibold mb-2">
          Mark Vendor as Unpaid?
        </h3>

        <p className="text-sm text-gray-600 mb-6">
          Are you sure you want to mark{" "}
          <span className="font-medium">{vendorName}</span> as unpaid
          for the current billing cycle?
        </p>

        <div className="flex justify-end gap-3">
          <button
            className="px-4 py-2 rounded border"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>

          <button
            className="px-4 py-2 rounded bg-red-600 text-white"
            onClick={onConfirm}
            disabled={loading}
          >
            Mark Unpaid
          </button>
        </div>
      </div>
    </div>
  );
}
