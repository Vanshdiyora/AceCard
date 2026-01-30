import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import BrandLoader from "./BrandLoader";

/* ================= TYPES ================= */

interface Option {
  label: string;
  value: any;
}

interface Props {
  value: any; // single: value, multi: value[]
  onChange: (v: any) => void;
  options: Option[];
  placeholder?: string;
  multiple?: boolean;
  disabled?: boolean;
  onScrollEnd?: () => void;
  loading?: boolean;
  onSearch?: (value: string) => void;
  hideValues?: boolean;
}

/* ================= COMPONENT ================= */

export default function SearchableSelect({
  value,
  onChange,
  options,
  placeholder = "Select...",
  multiple = false,
  disabled,
  onScrollEnd,
  loading,
  onSearch,
  hideValues = false,
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });

  const triggerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filtered = options.filter((o) =>
    o.label.toLowerCase().includes(query.toLowerCase())
  );

  /* ---------- CLOSE ON OUTSIDE CLICK ---------- */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const t = e.target as Node;
      if (
        !triggerRef.current?.contains(t) &&
        !dropdownRef.current?.contains(t)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* ---------- SELECT ---------- */
  const toggleValue = (val: any) => {
    if (!multiple) {
      onChange(val);
      setOpen(false);
      return;
    }

    const arr = Array.isArray(value) ? value : [];
    onChange(
      arr.includes(val)
        ? arr.filter((v) => v !== val)
        : [...arr, val]
    );
  };

  const isSelected = (val: any) =>
    multiple ? Array.isArray(value) && value.includes(val) : value === val;

  return (
    <>
      {/* ================= TRIGGER ================= */}
      <div
        ref={triggerRef}
        onClick={() => {
          if (disabled) return;
          const r = triggerRef.current?.getBoundingClientRect();
          if (r) {
            setPos({
              top: r.bottom + window.scrollY,
              left: r.left + window.scrollX,
              width: r.width,
            });
          }
          setOpen((s) => !s);
        }}
        className={`border rounded-lg px-3 py-2 text-sm cursor-pointer bg-white
          ${disabled ? "opacity-50" : ""}
        `}
      >
        {/* MULTI SELECT VALUES */}
        {multiple && Array.isArray(value) && value.length > 0 && !hideValues && (
          <div className="flex flex-wrap gap-1">
            {options
              .filter((o) => value.includes(o.value))
              .map((o) => (
                <span
                  key={o.value}
                  className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-xs"
                >
                  {o.label}
                </span>
              ))}
          </div>
        )}

        {/* SINGLE SELECT VALUE */}
        {!multiple && value != null && !hideValues && (
          <span className="text-gray-800">
            {options.find((o) => o.value === value)?.label || placeholder}
          </span>
        )}

        {/* PLACEHOLDER */}
        {((multiple && (!Array.isArray(value) || value.length === 0)) ||
          (!multiple && (value == null || hideValues))) && (
          <span className="text-gray-600">{placeholder}</span>
        )}
      </div>

      {/* ================= DROPDOWN ================= */}
      {open &&
        createPortal(
          <div
            ref={dropdownRef}
            className="fixed z-[99999] bg-white border rounded-xl shadow-lg"
            style={{
              top: pos.top,
              left: pos.left,
              width: pos.width,
            }}
          >
            {/* SEARCH */}
            <input
              autoFocus
              placeholder="Search..."
              value={query}
              onChange={(e) => {
                const v = e.target.value;
                setQuery(v);
                onSearch?.(v);
              }}
              className="w-full px-3 py-2 border-b outline-none text-sm"
            />

            {/* LIST */}
            <div
              className="max-h-64 overflow-y-auto custom-scrollbar"
              onScroll={(e) => {
                const el = e.currentTarget;
                if (el.scrollTop + el.clientHeight >= el.scrollHeight - 5) {
                  onScrollEnd?.();
                }
              }}
            >
              {filtered.map((opt) => (
                <div
                  key={opt.value}
                  onClick={() => toggleValue(opt.value)}
                  className={`px-3 py-2 text-sm cursor-pointer hover:bg-purple-50
                    ${isSelected(opt.value) ? "bg-purple-100" : ""}
                  `}
                >
                  {opt.label}
                </div>
              ))}

              {loading && (
                <div className="flex justify-center py-2">
                  <BrandLoader />
                </div>
              )}

              {!loading && filtered.length === 0 && (
                <p className="text-sm text-gray-400 p-3">No results</p>
              )}
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
