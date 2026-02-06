import { createPortal } from "react-dom";
import { X } from "lucide-react";

export function ProfileLayoutModal({
  open,
  onClose,
  onSave,
  children,
}: {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  children: React.ReactNode;
}) {
  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-black/60 animate-fade-in flex items-end sm:items-center">
      <div
        onClick={(e) => e.stopPropagation()}
        className="
          bg-white w-full h-full sm:h-auto
          sm:max-w-2xl sm:max-h-[90vh]
          flex flex-col
          rounded-t-3xl sm:rounded-2xl
          shadow-xl
          animate-slide-up sm:animate-scale-fade
        "
      >
        {/* HEADER */}
        <div className="sticky top-0 z-10 bg-white border-b p-4 flex justify-between">
          <h3 className="text-lg font-semibold">Card Layout Settings</h3>
          <button onClick={onClose}>
            <X />
          </button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-4">
          {children}
        </div>

        {/* FOOTER */}
        <div className="sticky bottom-0 border-t bg-white p-4 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border font-semibold"
          >
            Close
          </button>

          <button
            onClick={onSave}
            className="flex-1 py-3 rounded-xl bg-purple-600 text-white font-semibold"
          >
            Save
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
