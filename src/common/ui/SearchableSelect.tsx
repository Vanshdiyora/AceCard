import { useEffect, useRef, useState } from "react";
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
  onSearch?: (value: string) => void; // ✅ ADD
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
  onSearch
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  const filtered = options.filter((o) =>
    o.label.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

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
    multiple ? value?.includes(val) : value === val;

  return (
    <div ref={ref} className="relative">
      {/* INPUT */}
      <div
        onClick={() => !disabled && setOpen((s) => !s)}
        className={`border rounded-lg px-3 py-2 text-sm cursor-pointer bg-white
          ${disabled ? "opacity-50" : ""}
        `}
      >
        {multiple && Array.isArray(value) && value.length > 0 ? (
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
        ) : (
          <span className="text-gray-600">
            {options.find((o) => o.value === value)?.label ||
              placeholder}
          </span>
        )}
      </div>

      {/* DROPDOWN */}
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border rounded-xl shadow-lg">
          <input
            autoFocus
            placeholder="Search..."
            value={query}
            onChange={(e) => {
  const v = e.target.value;
  setQuery(v);        // keep local filtering
  onSearch?.(v);      // 🔥 CALL API
}}

            className="w-full px-3 py-2 border-b outline-none text-sm"
          />

          <div
            className="max-h-56 overflow-y-auto"
            onScroll={(e) => {
              const el = e.currentTarget;
              if (
                el.scrollTop + el.clientHeight >=
                el.scrollHeight - 5
              ) {
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
              <p className="text-sm text-gray-400 p-3">
                No results
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
