import { AlertTriangle } from "lucide-react";

interface ConfirmationModalProps {
  open: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  confirmVariant?: "danger" | "success" | "primary";
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const variantStyles = {
  danger: "bg-red-600 hover:bg-red-700",
  success: "bg-green-600 hover:bg-green-700",
  primary: "bg-purple-600 hover:bg-purple-700",
};

export default function ConfirmationModal({
  open,
  title = "Are you sure?",
  message,
  confirmLabel = "Confirm",
  confirmVariant = "primary",
  loading = false,
  onClose,
  onConfirm,
}: ConfirmationModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-[380px]">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="text-yellow-500" size={20} />
          <h2 className="text-lg font-semibold">{title}</h2>
        </div>

        <p className="text-sm text-gray-600 mb-5">{message}</p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm border rounded hover:bg-gray-50"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 text-sm text-white rounded ${variantStyles[confirmVariant]} disabled:opacity-50`}
          >
            {loading ? "Please wait..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
