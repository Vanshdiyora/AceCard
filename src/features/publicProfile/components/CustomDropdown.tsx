import { useRef, useEffect, useState } from "react";
import type { ContactField } from "../../settings/components/vice/VicePublicSetting";

export function CustomDropdown({
  field,
  value,
  onChange,
  theme,
}: {
  field: ContactField;
  value: string;
  onChange: (v: string) => void;
  theme: any;
}) {
  const [open, setOpen] = useState(false);
  const [openUp, setOpenUp] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  /* ================= OPEN DIRECTION ================= */
  useEffect(() => {
    if (!open || !ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;

    if (spaceBelow < 200 && spaceAbove > spaceBelow) {
      setOpenUp(true);
    } else {
      setOpenUp(false);
    }
  }, [open]);

  /* ================= CLOSE ON OUTSIDE CLICK ================= */
  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  /* ================= CLOSE ON SCROLL ================= */
  useEffect(() => {
    if (!open) return;

    const handleScroll = () => {
      setOpen(false);
    };

    window.addEventListener("scroll", handleScroll, true); // true = capture (detect parent scroll)

    return () => {
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="w-full px-4 py-3 rounded-xl text-sm text-left"
        style={{
          backgroundColor: theme.button_color ?? "#fff",
          color: theme.button_text ?? "#000",
        }}
      >
        {value || `Select ${field.label}`}
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className={`absolute left-0 w-full rounded-xl shadow-lg border overflow-y-auto max-h-48 z-50 ${
            openUp ? "bottom-full mb-2" : "top-full mt-2"
          }`}
          style={{
            backgroundColor: theme.card_background,
            color: theme.card_text,
          }}
        >
          {(field.options ?? []).map((opt, i) => (
            <div
              key={i}
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
              className="px-4 py-2 text-sm hover:bg-black/5 cursor-pointer"
            >
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}