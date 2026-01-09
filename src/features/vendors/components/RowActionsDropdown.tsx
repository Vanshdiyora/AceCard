import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Edit3,
  SlidersHorizontal,
  Trash2,
  Bell,
  ArchiveRestore,
} from "lucide-react";

interface RowActionsDropdownProps {
  status?: "active" | "archived";
  onEdit?: () => void;
  onSeats?: () => void;
  onArchive?: () => void;
  onUnarchive?: () => void;
  onNotify?: () => void;
}

const DROPDOWN_HEIGHT = 176;
const DROPDOWN_WIDTH = 176;

export default function RowActionsDropdown({
  status,
  onEdit,
  onSeats,
  onArchive,
  onUnarchive,
  onNotify,
}: RowActionsDropdownProps) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  function updatePosition() {
    if (!buttonRef.current) return;

    const rect = buttonRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;

    let top = rect.bottom + 6;
    if (viewportHeight - rect.bottom < DROPDOWN_HEIGHT + 8) {
      top = rect.top - DROPDOWN_HEIGHT - 6;
    }

    let left = rect.right - DROPDOWN_WIDTH;
    left = Math.max(8, Math.min(left, window.innerWidth - DROPDOWN_WIDTH - 8));

    setPos({
      top: top + window.scrollY,
      left: left + window.scrollX,
    });
  }

  useEffect(() => {
    if (!open) return;

    updatePosition();
    window.addEventListener("scroll", updatePosition);
    window.addEventListener("resize", updatePosition);

    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        !buttonRef.current?.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("scroll", updatePosition);
      window.removeEventListener("resize", updatePosition);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  const closeAndRun = (fn?: () => void) => () => {
    fn?.();
    setOpen(false);
  };

  return (
    <>
      <button
        ref={buttonRef}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        className="p-2 rounded hover:bg-gray-100 transition"
      >
        <SlidersHorizontal size={18} className="text-gray-600" />
      </button>

      {open &&
        createPortal(
          <div
            ref={dropdownRef}
            className="absolute z-[9999] w-44 bg-white border shadow-lg rounded-xl overflow-hidden animate-fadeIn"
            style={{ top: pos.top, left: pos.left }}
          >
            <MenuItem icon={<Edit3 size={16} />} label="Edit Vendor" onClick={closeAndRun(onEdit)} />
            <MenuItem icon={<SlidersHorizontal size={16} />} label="Update Seats" onClick={closeAndRun(onSeats)} />
            <MenuItem icon={<Bell size={16} />} label="Notify Vendor" onClick={closeAndRun(onNotify)} />

            {status === "archived" ? (
              <MenuItem
                icon={<ArchiveRestore size={16} className="text-green-600" />}
                label="Unarchive Vendor"
                onClick={closeAndRun(onUnarchive)}
              />
            ) : (
              <MenuItem
                icon={<Trash2 size={16} className="text-red-500" />}
                label="Archive Vendor"
                danger
                onClick={closeAndRun(onArchive)}
              />
            )}
          </div>,
          document.body
        )}
    </>
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
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      className={`flex items-center gap-3 w-full px-4 py-2.5 text-sm text-left transition ${
        danger
          ? "text-red-600 font-medium hover:bg-red-50"
          : "text-gray-700 hover:bg-gray-100"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
