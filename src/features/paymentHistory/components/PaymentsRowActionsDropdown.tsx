import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  MoreVertical,
  CheckCircle,
  Users,
  IndianRupee,
  Archive,
} from "lucide-react";

type Props = {
  onPaid: () => void;
  onEditSeats: () => void;
  onEditPrice: () => void;
  onArchive: () => void;
};

const DROPDOWN_HEIGHT = 180; // px (safe estimate)

export default function PaymentsRowActionsDropdown({
  onPaid,
  onEditSeats,
  onEditPrice,
  onArchive,
}: Props) {
  const [open, setOpen] = useState(false);
  const [, setPlacement] = useState<"top" | "bottom">("bottom");

  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [pos, setPos] = useState({ top: 0, left: 0 });

  /* ---------------------- calculate position ---------------------- */
  useEffect(() => {
    if (!open || !buttonRef.current) return;

    const rect = buttonRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;

    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;

    const shouldOpenTop =
      spaceBelow < DROPDOWN_HEIGHT && spaceAbove > spaceBelow;

    setPlacement(shouldOpenTop ? "top" : "bottom");

    setPos({
      left: rect.right - 200, // align right
      top: shouldOpenTop
        ? rect.top - DROPDOWN_HEIGHT + 30
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
        <MoreVertical size={16} />
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
            <button
              className="w-full px-4 py-2 flex items-center gap-2 hover:bg-gray-50"
              onClick={() => {
                onPaid();
                setOpen(false);
              }}
            >
              <CheckCircle size={16} className="text-green-600" />
              Mark as Paid
            </button>

            <button
              className="w-full px-4 py-2 flex items-center gap-2 hover:bg-gray-50"
              onClick={() => {
                onEditSeats();
                setOpen(false);
              }}
            >
              <Users size={16} className="text-gray-600" />
              Edit Seats
            </button>

            <button
              className="w-full px-4 py-2 flex items-center gap-2 hover:bg-gray-50"
              onClick={() => {
                onEditPrice();
                setOpen(false);
              }}
            >
              <IndianRupee size={16} className="text-gray-600" />
              Edit Price / Seat
            </button>

            <div className="h-px bg-gray-100" />

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
          </div>,
          document.body
        )}
    </>
  );
}
