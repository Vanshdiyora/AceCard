import ResultModal from "../../../common/ui/ResultModal";

export default function ActionConfirmationModal({
  open,
  title,
  message,
  loading,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  title: string;
  message: string;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!open) return null;

  return (
    <ResultModal open={open} success message="" onClose={onCancel}>
      <h3 className="text-lg font-semibold mb-3">
        {title}
      </h3>

      <p className="text-sm text-gray-600 mb-6">
        {message}
      </p>

      <div className="flex justify-end gap-3">
        <button
          className="px-4 py-2 text-sm rounded border"
          onClick={onCancel}
        >
          Cancel
        </button>

        <button
          disabled={loading}
          className="px-4 py-2 text-sm rounded bg-purple-600 text-white disabled:opacity-50"
          onClick={onConfirm}
        >
          Confirm
        </button>
      </div>
    </ResultModal>
  );
}