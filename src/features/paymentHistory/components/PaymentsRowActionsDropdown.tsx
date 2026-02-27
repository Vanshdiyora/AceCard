import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  SlidersHorizontal,
  CheckCircle,
  Archive,
  RefreshCcw, // ✅ new icon
} from "lucide-react";

type Props = {
  onPaid: () => void;
  onMarkUnpaid?: () => void;
  onUpdateSubscription?: () => void; // ✅ ADDED
  onArchive?: () => void;
};

export default function PaymentsRowActionsDropdown({
  onPaid,
  onUpdateSubscription,
  onArchive,
}: Props) {
  const [open, setOpen] = useState(false);
  const [, setPlacement] = useState<"top" | "bottom">("bottom");

  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [pos, setPos] = useState({ top: 0, left: 0 });

  /* ---------------------- calculate position ---------------------- */
  useEffect(() => {
    if (!open || !buttonRef.current || !dropdownRef.current) return;

    const rect = buttonRef.current.getBoundingClientRect();
    const dropdownHeight = dropdownRef.current.offsetHeight;
    const viewportHeight = window.innerHeight;

    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;

    const shouldOpenTop =
      spaceBelow < dropdownHeight && spaceAbove > spaceBelow;

    setPlacement(shouldOpenTop ? "top" : "bottom");

    setPos({
      left: rect.right - 192,
      top: shouldOpenTop
        ? rect.top - dropdownHeight - 6
        : rect.bottom + 6,
    });
  }, [open]);

  /* ---------------------- outside click ---------------------- */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        !buttonRef.current?.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* ---------------------- render ---------------------- */
  return (
    <>
      <button
        ref={buttonRef}
        className="p-1 rounded hover:bg-gray-100"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
      >
        <SlidersHorizontal size={18} className="text-gray-600" />
      </button>

      {open &&
        createPortal(
          <div
            ref={dropdownRef}
            style={{
              position: "fixed",
              top: pos.top,
              left: pos.left,
              zIndex: 9999,
            }}
            className="w-48 rounded-xl border bg-white shadow-lg overflow-hidden text-sm"
          >
            {/* MARK PAID */}
            <button
              className="w-full px-4 py-2 flex items-center gap-2 hover:bg-gray-50"
              onClick={() => {
                onPaid();
                setOpen(false);
              }}
            >
              <CheckCircle size={16} className="text-green-600" />
              Update Payment
            </button>

            {/* UPDATE SUBSCRIPTION */}
            {onUpdateSubscription && (
              <button
                className="w-full px-4 py-2 flex items-center gap-2 hover:bg-gray-50"
                onClick={() => {
                  onUpdateSubscription();
                  setOpen(false);
                }}
              >
                <RefreshCcw size={16} className="text-blue-600" />
                Update Subscription
              </button>
            )}

            {/* ARCHIVE */}
            {onArchive && (
              <button
                className="w-full px-4 py-2 flex items-center gap-2 text-red-600 hover:bg-red-50"
                onClick={() => {
                  onArchive();
                  setOpen(false);
                }}
              >
                <Archive size={16} />
                Archive
              </button>
            )}
          </div>,
          document.body
        )}
    </>
  );
}