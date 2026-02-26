import { createPortal } from "react-dom";

type Props = {
  open: boolean;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function GlobalSignOutConfirmationModal({
  open,
  loading = false,
  onCancel,
  onConfirm,
}: Props) {
  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl w-[420px] p-6 z-10">
        <h3 className="text-lg font-semibold mb-2">
          Confirm Sign Out
        </h3>

        <p className="text-sm text-gray-600 mb-6">
          Are you sure you want to sign out of your account?
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
            className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Signing out..." : "Sign Out"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}