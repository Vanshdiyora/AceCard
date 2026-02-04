import { createPortal } from "react-dom";
import { X } from "lucide-react";

export function ProfileLayoutModal({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-black/60">
      <div
        onClick={(e) => e.stopPropagation()}
        className="
          absolute inset-0
          bg-white
          flex flex-col
          h-full w-full
          sm:relative sm:mx-auto sm:my-8 sm:max-w-2xl sm:max-h-[90vh]
          rounded-none sm:rounded-2xl
          shadow-xl
        "
      >
        {/* HEADER */}
        <div className="flex-none sticky top-0 z-10 bg-white border-b p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Card Layout Settings</h3>
            <button onClick={onClose}>
              <X />
            </button>
          </div>
        </div>

        {/* SCROLL BODY */}
        <div className="flex-1 overflow-y-auto p-4">
          {children}

          {/* bottom safe-area spacer */}
       
        </div>
      </div>
    </div>,
    document.body
  );
}
