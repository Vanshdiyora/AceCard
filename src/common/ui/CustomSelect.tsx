import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { createPortal } from "react-dom";

interface Option {
  label: string;
  value: any;
}

interface CustomSelectProps {
  value: any;
  options: Option[];
  onChange: (value: any) => void;
  placeholder?: string;
  disabled?: boolean;
}

export default function CustomSelect({
  value,
  options,
  onChange,
  placeholder = "Select",
  disabled,
}: CustomSelectProps) {
  const [open, setOpen] = useState(false);

  const triggerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;

      if (
        triggerRef.current?.contains(target) ||
        dropdownRef.current?.contains(target)
      ) {
        return;
      }

      setOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const rect = triggerRef.current?.getBoundingClientRect();

  return (
    <>
      {/* Trigger */}
      <div ref={triggerRef} className="relative w-full">
        <button
          type="button"
          disabled={disabled}
          onClick={() => setOpen((v) => !v)}
          className="
            w-full flex items-center justify-between
            border border-gray-300 rounded-lg
            px-3 py-2 text-sm
            bg-white text-left
            focus:outline-none focus-visible:ring-2
            focus-visible:ring-purple-500
            focus-visible:ring-offset-2
            disabled:bg-gray-100 disabled:cursor-not-allowed
          "
        >
          <span className={selected ? "" : "text-gray-400"}>
            {selected?.label || placeholder}
          </span>
          <ChevronDown className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      {/* Dropdown (PORTAL) */}
      {open &&
        rect &&
        createPortal(
          <div
            ref={dropdownRef}
            className="
              fixed z-[9999]
              rounded-lg border bg-white shadow-md
              max-h-60 overflow-y-auto
            "
            style={{
              top: rect.bottom + 4,
              left: rect.left,
              width: rect.width,
            }}
          >
            {options.map((opt) => (
              <div
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={`
                  px-3 py-2 text-sm cursor-pointer
                  hover:bg-gray-200
                  ${
                    opt.value === value
                      ? "bg-gray-300 font-medium"
                      : ""
                  }
                `}
              >
                {opt.label}
              </div>
            ))}
          </div>,
          document.body
        )}
    </>
  );
}
