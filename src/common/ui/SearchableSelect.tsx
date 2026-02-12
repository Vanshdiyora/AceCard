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
  const [openUp, setOpenUp] = useState(false); // ✅ ADD

  const triggerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filtered = options.filter((o) =>
    o.label.toLowerCase().includes(query.toLowerCase())
  );

  /* ---------- CLOSE ON SCROLL / RESIZE ---------- */
  useEffect(() => {
  if (!open) return;

  const handleScroll = (e: Event) => {
    const target = e.target as Node;

    // ✅ Ignore scroll inside dropdown
    if (dropdownRef.current?.contains(target)) {
      return;
    }

    setOpen(false);
  };

  window.addEventListener("scroll", handleScroll, true);
  window.addEventListener("resize", handleScroll);

  return () => {
    window.removeEventListener("scroll", handleScroll, true);
    window.removeEventListener("resize", handleScroll);
  };
}, [open]);


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
          if (!r) return;

          const viewportHeight = window.innerHeight;
          const spaceBelow = viewportHeight - r.bottom;
          const spaceAbove = r.top;

          const DROPDOWN_ESTIMATED_HEIGHT = 260;

          const shouldOpenUp =
            spaceBelow < DROPDOWN_ESTIMATED_HEIGHT &&
            spaceAbove > spaceBelow;

          setOpenUp(shouldOpenUp);

          setPos({
            top: shouldOpenUp
              ? r.top + window.scrollY
              : r.bottom + window.scrollY,
            left: r.left + window.scrollX,
            width: r.width,
          });

          setOpen((s) => !s);
        }}
        className={`border rounded-lg px-3 py-2 text-sm cursor-pointer bg-white
          min-h-[44px] flex items-center
          ${disabled ? "opacity-50" : ""}
        `}
      >
        <div className="flex items-center flex-wrap w-full min-h-[20px] gap-1">

          {/* MULTIPLE SELECT */}
          {multiple ? (
            Array.isArray(value) && value.length > 0 && !hideValues ? (
              options
                .filter((o) => value.includes(o.value))
                .map((o) => (
                  <span
                    key={o.value}
                    className="flex items-center gap-1 bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-xs"
                  >
                    {o.label}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        const updated = value.filter((v: any) => v !== o.value);
                        onChange(updated);
                      }}
                      className="ml-1 text-purple-500 hover:text-red-500 font-bold"
                    >
                      ×
                    </button>
                  </span>
                ))
            ) : (
              <span className="text-gray-400 text-sm">
                {placeholder}
              </span>
            )
          ) : (
            /* SINGLE SELECT */
            value != null && !hideValues ? (
              <span className="text-gray-800 truncate">
                {options.find((o) => o.value === value)?.label}
              </span>
            ) : (
              <span className="text-gray-400 text-sm">
                {placeholder}
              </span>
            )
          )}

        </div>

      </div>

      {/* ================= DROPDOWN ================= */}
      {open &&
        createPortal(
          <div
            ref={dropdownRef}
            className="fixed z-[99999] bg-white border rounded-xl shadow-lg"
            style={{
              top: openUp ? undefined : pos.top,
              bottom: openUp
                ? window.innerHeight - pos.top + "px"
                : undefined,
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
