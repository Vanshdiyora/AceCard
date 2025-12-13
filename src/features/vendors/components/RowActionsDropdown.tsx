import { useState, useRef, useEffect } from "react";
import {
  Edit3,
  SlidersHorizontal,
  Trash2,
  Bell
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

  // Close on outside click
  useEffect(() => {
    function close(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <div className="relative" ref={ref}>
      {/* Trigger Button */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="p-2 rounded hover:bg-gray-100 transition"
      >
        <SlidersHorizontal size={18} className="text-gray-600" />
      </button>

      {/* Dropdown Menu */}
      {open && (
        <div
          className="
          absolute right-0 top-10 w-44 bg-white border shadow-lg rounded-xl 
          overflow-hidden animate-fadeIn z-40
        "
        >
          <MenuItem icon={<Edit3 size={16} />} label="Edit Vendor" onClick={onEdit} />

          <MenuItem
            icon={<SlidersHorizontal size={16} />}
            label="Update Seats"
            onClick={onSeats}
          />

          <MenuItem icon={<Bell size={16} />} label="Notify Vendor" onClick={onNotify} />

          <MenuItem
            icon={<Trash2 size={16} className="text-red-500" />}
            label="Archive Vendor"
            danger
            onClick={onArchive}
          />
        </div>
      )}
    </div>
  );
}

// Reusable menu item
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
      onClick={() => {
        onClick?.();
      }}
      className={`
        flex items-center gap-3 w-full px-4 py-2.5 text-sm text-left
        hover:bg-gray-100 transition
        ${danger ? "text-red-600 font-medium" : "text-gray-700"}
      `}
    >
      {icon}
      {label}
    </button>
  );
}
