import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import BrandLoader from "./BrandLoader";

interface Option {
  label: string;
  value: any;
}

interface Props {
  value: any;
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

  const [pos, setPos] = useState({
    top: 0,
    left: 0,
    width: 0,
  });

  const triggerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const onScrollEndRef = useRef(onScrollEnd);
  const loadingRef = useRef(loading);

  useEffect(() => {
    onScrollEndRef.current = onScrollEnd;
  }, [onScrollEnd]);

  useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);

  const filtered = options.filter((o) =>
    o.label.toLowerCase().includes(query.toLowerCase())
  );

  /* ---------- POSITION CALCULATION ---------- */

  const updatePos = () => {
    const trigger = triggerRef.current;
    const dropdown = dropdownRef.current;

    if (!trigger) return;

    const r = trigger.getBoundingClientRect();

    const viewportHeight = window.innerHeight;
    const spaceBelow = viewportHeight - r.bottom;
    const spaceAbove = r.top;

    const dropdownHeight = dropdown?.offsetHeight || 260;

    let top = r.bottom;

    if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
      top = r.top - dropdownHeight;
    }

    setPos({
      top,
      left: r.left,
      width: r.width,
    });
  };

  /* ---------- AUTO LOAD MORE ---------- */

  useEffect(() => {
    if (!open) return;
    if (!onScrollEndRef.current) return;

    const id = setTimeout(() => {
      const el = dropdownRef.current?.querySelector(
        ".scroll-list"
      ) as HTMLElement | null;

      if (!el) return;

      if (el.scrollHeight <= el.clientHeight && !loadingRef.current) {
        onScrollEndRef.current?.();
      }
    }, 150);

    return () => clearTimeout(id);
  }, [open, filtered.length]);

  /* ---------- OUTSIDE CLICK ---------- */

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

  /* ---------- SCROLL CLOSE ---------- */

  useEffect(() => {
    if (!open) return;

    const handleScroll = (e: Event) => {
      const target = e.target as Node;

      if (dropdownRef.current?.contains(target)) return;

      setOpen(false);
    };

    const handleResize = () => setOpen(false);

    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleResize);
    };
  }, [open]);

  /* ---------- POSITION AFTER OPEN ---------- */

  useEffect(() => {
    if (!open) return;

    requestAnimationFrame(updatePos);
  }, [open, filtered.length]);

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
    multiple
      ? Array.isArray(value) && value.some((v) => v == val)
      : value == val;

  return (
    <>
      {/* TRIGGER */}
      <div
        ref={triggerRef}
        onClick={() => {
          if (disabled) return;
          setOpen((s) => !s);
        }}
        className={`border rounded-lg px-3 py-2 text-sm cursor-pointer bg-white min-h-[44px] flex items-center ${
          disabled ? "opacity-50" : ""
        }`}
      >
        <div className="flex items-center flex-wrap w-full min-h-[20px] gap-1">
          {multiple ? (
            Array.isArray(value) && value.length > 0 && !hideValues ? (
              value.map((v: any) => {
                const opt = options.find((o) => o.value === v);

                return (
                  <span
                    key={v}
                    className="flex items-center gap-1 bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-xs"
                  >
                    {opt?.label ?? `ID: ${v}`}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        const updated = value.filter((val: any) => val !== v);
                        onChange(updated);
                      }}
                      className="ml-1 text-purple-500 hover:text-red-500 font-bold"
                    >
                      ×
                    </button>
                  </span>
                );
              })
            ) : (
              <span className="text-gray-400 text-sm">
                {Array.isArray(value) && value.length > 0 && hideValues
                  ? `${value.length} selected`
                  : placeholder}
              </span>
            )
          ) : (
            (() => {
              const selectedOption = options.find((o) => o.value == value);

              if (!selectedOption || hideValues) {
                return (
                  <span className="text-gray-400 text-sm">{placeholder}</span>
                );
              }

              return (
                <span className="text-gray-800 truncate">
                  {selectedOption.label}
                </span>
              );
            })()
          )}
        </div>
      </div>

      {/* DROPDOWN */}
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

            <div
              className="scroll-list max-h-64 overflow-y-auto custom-scrollbar"
              onScroll={(e) => {
                const el = e.currentTarget;

                const nearBottom =
                  el.scrollTop + el.clientHeight >= el.scrollHeight - 5;

                if (nearBottom && !loadingRef.current) {
                  onScrollEndRef.current?.();
                }
              }}
            >
              {filtered.map((opt) => (
                <div
                  key={opt.value}
                  onClick={() => toggleValue(opt.value)}
                  className={`px-3 py-2 text-sm cursor-pointer hover:bg-purple-50 ${
                    isSelected(opt.value) ? "bg-purple-100" : ""
                  }`}
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