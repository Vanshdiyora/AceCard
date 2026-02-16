import { useState, useRef, useEffect, useCallback } from "react";
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
  hasMore?: boolean;              // ✅ for infinite scroll
  onLoadMore?: () => void;        // ✅ for infinite scroll
}

export default function CustomSelect({
  value,
  options,
  onChange,
  placeholder = "Select",
  disabled,
  hasMore = false,
  onLoadMore,
}: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState<any>({});

  const triggerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);

  /* ==============================
     OUTSIDE CLICK
  ============================== */
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;

      if (
        triggerRef.current?.contains(target) ||
        dropdownRef.current?.contains(target)
      )
        return;

      setOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ==============================
     VIEWPORT POSITIONING
  ============================== */
/* ==============================
   VIEWPORT POSITIONING (FIXED)
============================== */
/* ==============================
   PERFECT VIEWPORT POSITIONING
============================== */
useEffect(() => {
  if (!open || !triggerRef.current) return;

  const rect = triggerRef.current.getBoundingClientRect();
  const spaceBelow = window.innerHeight - rect.bottom;
  const spaceAbove = rect.top;

  const maxHeight = 240;

  // Temporarily set below to measure natural height
  let calculatedTop = rect.bottom + 4;
  let calculatedMaxHeight = Math.min(spaceBelow - 8, maxHeight);

  // Wait for next paint so dropdownRef exists
  requestAnimationFrame(() => {
    const dropdownHeight =
      dropdownRef.current?.offsetHeight || maxHeight;

    const shouldOpenUp =
      spaceBelow < dropdownHeight && spaceAbove > spaceBelow;

    if (shouldOpenUp) {
      calculatedMaxHeight = Math.min(spaceAbove - 8, maxHeight);
      calculatedTop = rect.top - dropdownHeight - 4;
    }

    setDropdownStyle({
      position: "fixed",
      left: rect.left,
      width: rect.width,
      top: calculatedTop,
      maxHeight: calculatedMaxHeight,
      zIndex: 9999,
    });
  });
}, [open, options]);


  /* ==============================
     INFINITE SCROLL
  ============================== */
  const handleScroll = useCallback(() => {
    if (!dropdownRef.current || !hasMore || !onLoadMore) return;

    const { scrollTop, scrollHeight, clientHeight } =
      dropdownRef.current;

    if (scrollTop + clientHeight >= scrollHeight - 20) {
      onLoadMore();
    }
  }, [hasMore, onLoadMore]);

  return (
    <>
      {/* Trigger */}
      <div ref={triggerRef} className="relative w-full">
        <button
          type="button"
          disabled={disabled}
          onClick={() => setOpen((v) => !v)}
          className="w-full flex items-center justify-between border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          <span className={selected ? "" : "text-gray-400"}>
            {selected?.label || placeholder}
          </span>
          <ChevronDown className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      {/* Dropdown */}
      {open &&
        createPortal(
          <div
            ref={dropdownRef}
            style={dropdownStyle}
            onScroll={handleScroll}
            className="rounded-lg border bg-white shadow-md overflow-y-auto"
          >
            {options.map((opt) => (
              <div
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-200 ${
                  opt.value === value
                    ? "bg-gray-300 font-medium"
                    : ""
                }`}
              >
                {opt.label}
              </div>
            ))}

            {hasMore && (
              <div className="px-3 py-2 text-xs text-gray-400 text-center">
                Loading more...
              </div>
            )}
          </div>,
          document.body
        )}
    </>
  );
}
