interface ArchiveConfirmationModalProps {
  open: boolean;
  vendorName?: string;
  onCancel: () => void;
  onConfirm: () => void;
  loading?: boolean;
}

export default function ArchiveConfirmationModal({
  open,
  vendorName,
  onCancel,
  onConfirm,
  loading = false,
}: ArchiveConfirmationModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-[420px] rounded-2xl shadow-xl">

        {/* Header */}
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-red-600">
            Archive Vendor
          </h2>
          <p className="text-xs text-gray-500">
            This action cannot be undone
          </p>
        </div>

        {/* Body */}
        <div className="px-6 py-5 text-sm text-gray-700">
          Are you sure you want to archive{" "}
          <span className="font-semibold">
            {vendorName ?? "this vendor"}
          </span>
          ?
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t flex justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 border rounded-lg"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 bg-red-600 text-white rounded-lg"
          >
            {loading ? "Archiving..." : "Yes, Archive"}
          </button>
        </div>
      </div>
    </div>
  );
}
