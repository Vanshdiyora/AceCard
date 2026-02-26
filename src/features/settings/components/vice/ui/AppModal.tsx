import { type ReactNode, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, ArrowLeft } from "lucide-react";

interface AppModalProps {
  open: boolean;
  title?: string;
  description?: string;
  size?: "sm" | "md" | "lg" | "xl";
  children: ReactNode;

  onClose: () => void;
  onConfirm?: () => void;

  confirmText?: string;
  cancelText?: string;
  showFooter?: boolean;
  loading?: boolean;
  showBack?: boolean;
  onBack?: () => void;
  errorMessage?: string | null;
}

export default function AppModal({
  open,
  title,
  description,
  size = "md",
  children,
  onClose,
  onConfirm,
  confirmText = "Save",
  cancelText = "Cancel",
  showFooter = true,
  loading = false,
  showBack = false,
  onBack,
  errorMessage,
}: AppModalProps) {
  if (!open) return null;

  const widthMap = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-2xl",
  };

  // close on ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-black/40 flex items-center justify-center px-4">
      <div
        className={`w-full ${widthMap[size]} bg-white rounded-2xl shadow-xl animate-in fade-in zoom-in-95`}
      >
        {/* HEADER */}
        {(title || description || errorMessage) && (
          <div className="px-6 pt-6 pb-4 border-b space-y-3">
            <div className="flex items-start justify-between">
              <div>
                {showBack && (
                  <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition"
                  >
                    <ArrowLeft size={18} />
                    <span className="text-sm font-medium">Back</span>
                  </button>
                )}

                {title && (
                  <h3 className="text-lg font-semibold">{title}</h3>
                )}

                {description && (
                  <p className="text-sm text-gray-500 mt-1">
                    {description}
                  </p>
                )}
              </div>

              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-700"
              >
                <X size={18} />
              </button>
            </div>

            {/* 🔥 ERROR BANNER */}
            {errorMessage && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-600">
                {errorMessage}
              </div>
            )}
          </div>
        )}

        {/* BODY */}
        <div className="px-6 py-6 max-h-[70vh] overflow-y-auto">
          {children}
        </div>

        {/* FOOTER */}
        {showFooter && (
          <div className="px-6 py-4 border-t flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-sm"
            >
              {cancelText}
            </button>

            {onConfirm && (
              <button
                onClick={onConfirm}
                disabled={loading}
                className="px-4 py-2 rounded-lg bg-purple-600 text-white text-sm hover:opacity-90 disabled:opacity-50"
              >
                {loading ? "Saving..." : confirmText}
              </button>
            )}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
