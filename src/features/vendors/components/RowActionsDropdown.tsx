import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Edit3,
  SlidersHorizontal,
  Trash2,
  Bell,
} from "lucide-react";

interface RowActionsDropdownProps {
  onEdit?: () => void;
  onSeats?: () => void;
  onArchive?: () => void;
  onNotify?: () => void;
}

export default function RowActionsDropdown({
  onEdit,
  onSeats,
  onArchive,
  onNotify,
}: RowActionsDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function close(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  const rect = ref.current?.getBoundingClientRect();

  return (
    <div className="inline-block" ref={ref}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen((prev) => !prev);
        }}
        className="p-2 rounded hover:bg-gray-100 transition"
      >
        <SlidersHorizontal size={18} className="text-gray-600" />
      </button>

      {open &&
        rect &&
        createPortal(
          <div
            className="fixed z-[9999] w-44 bg-white border shadow-lg rounded-xl overflow-hidden animate-fadeIn pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
            style={{
              top: rect.bottom + 6,
              left: rect.right - 176,
            }}
          >
            <MenuItem
              icon={<Edit3 size={16} />}
              label="Edit Vendor"
              onClick={() => {
                onEdit?.();
                setOpen(false);
              }}
            />
            <MenuItem
              icon={<SlidersHorizontal size={16} />}
              label="Update Seats"
              onClick={() => {
                onSeats?.();
                setOpen(false);
              }}
            />
            <MenuItem
              icon={<Bell size={16} />}
              label="Notify Vendor"
              onClick={() => {
                onNotify?.();
                setOpen(false);
              }}
            />
            <MenuItem
              icon={<Trash2 size={16} className="text-red-500" />}
              label="Archive Vendor"
              danger
              onClick={() => {
                onArchive?.();
                setOpen(false);
              }}
            />
          </div>,
          document.body
        )}
    </div>
  );
}

function MenuItem({
  icon,
  label,
  onClick,
  danger,
}: {
  icon: React.ReactNode;
  label: string;
  danger?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 w-full px-4 py-2.5 text-sm text-left hover:bg-gray-100 transition ${
        danger ? "text-red-600 font-medium" : "text-gray-700"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
