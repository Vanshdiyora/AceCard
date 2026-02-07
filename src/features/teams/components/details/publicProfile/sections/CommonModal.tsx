import { createPortal } from "react-dom";

export default function CommonModal({
  open,
  title,
  description,
  children,
  onClose,
  onConfirm,
  confirmText = "Save",
  cancelText = "Cancel",
  width = "max-w-2xl",
  height = "h-[80vh]", // 👈 FIXED HEIGHT
}: {
  open: boolean;
  title: string;
  description?: string;
  children: React.ReactNode;
  onClose: () => void;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
  width?: string;
  height?: string;
}) {
  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[1000] bg-black/40 flex items-center justify-center">
      <div
        className={`
          w-full ${width} ${height}
          bg-white rounded-2xl shadow-xl
          flex flex-col
        `}
      >
        {/* HEADER (fixed) */}
        <div className="px-6 py-4 border-b shrink-0">
          <h3 className="text-lg font-semibold">{title}</h3>
          {description && (
            <p className="text-sm text-gray-500 mt-1">
              {description}
            </p>
          )}
        </div>

        {/* BODY (scroll only here) */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {children}
        </div>

        {/* FOOTER (fixed) */}
        <div className="px-6 py-4 border-t shrink-0 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border text-sm"
          >
            {cancelText}
          </button>

          {onConfirm && (
            <button
              onClick={onConfirm}
              className="px-4 py-2 rounded-lg bg-purple-600 text-white text-sm"
            >
              {confirmText}
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
