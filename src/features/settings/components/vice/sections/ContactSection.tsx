import { useState, useRef, useEffect } from "react";
import { Switch } from "../VicePublicSetting";
import type { ContactConfig, ContactField } from "../VicePublicSetting";
import { createPortal } from "react-dom";
import CommonItemsReorder from "./CommonItemsReorder";
import { ChevronDown, GripVertical, Plus, X } from "lucide-react";

/* =======================================================
SMART DROPDOWN
======================================================= */
function SmartDropdown({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [openUp, setOpenUp] = useState(false);
  const [position, setPosition] = useState({ left: 0, width: 0, top: 0 });

  const buttonRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const options = [
    { id: "text", label: "Text" },
    { id: "email", label: "Email" },
    { id: "number", label: "Number" },
    { id: "textarea", label: "Textarea" },
    { id: "dropdown", label: "Dropdown" },
    { id: "checkbox", label: "Checkbox" },
  ];

  useEffect(() => {
    if (!open || !buttonRef.current) return;

    const rect = buttonRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let left = rect.left;
    let width = rect.width;

    if (left + width > viewportWidth - 8) left = viewportWidth - width - 8;
    if (left < 8) left = 8;

    const spaceBelow = viewportHeight - rect.bottom;
    const shouldOpenUp = spaceBelow < 220;
    setOpenUp(shouldOpenUp);

    setPosition({
      left,
      width: Math.min(width, viewportWidth - 16),
      top: shouldOpenUp ? rect.top - 8 : rect.bottom + 8,
    });
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const handleOutside = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (
        buttonRef.current?.contains(target) ||
        dropdownRef.current?.contains(target)
      ) return;
      setOpen(false);
    };

    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("touchstart", handleOutside);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("touchstart", handleOutside);
    };
  }, [open]);

  const active = options.find((o) => o.id === value) || options[0];

  return (
    <>
      <div ref={buttonRef}>
        <button
          type="button"
          disabled={disabled}
          onClick={() => { if (disabled) return; setOpen((p) => !p); }}
          className={`w-full flex items-center justify-between rounded-xl border px-4 py-3 bg-white ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
        >
          {active.label}
          <ChevronDown size={16} className={`transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
      </div>

      {!disabled && open && createPortal(
        <div
          ref={dropdownRef}
          style={{
            position: "fixed",
            left: position.left,
            width: position.width,
            top: position.top,
            zIndex: 9999,
          }}
          className={`bg-white border rounded-xl shadow-lg max-h-60 overflow-auto ${openUp ? "translate-y-[-100%]" : ""}`}
        >
          {options.map((opt) => (
            <button
              key={opt.id}
              type="button"
              // onPointerDown fires on both mouse and touch — prevents ghost click issues
              onPointerDown={(e) => {
                e.preventDefault();
                onChange(opt.id);
                setOpen(false);
              }}
              className={`block w-full text-left px-4 py-3 hover:bg-gray-100 active:bg-gray-200 ${opt.id === value ? "bg-gray-100 font-medium" : ""}`}
            >
              {opt.label}
            </button>
          ))}
        </div>,
        document.body
      )}
    </>
  );
}

/* =======================================================
DROPDOWN OPTIONS EDITOR — touch drag support
======================================================= */
function DropdownOptionsEditor({
  options = [],
  disabled,
  onChange,
}: {
  options: string[];
  disabled?: boolean;
  onChange: (opts: string[]) => void;
}) {
  const [optionError, setOptionError] = useState<string | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);

  // Use refs so touch handlers always have fresh values without stale closures
  const dragIndexRef = useRef<number | null>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const addOption = () => {
    if (options.length > 0) {
      const last = options[options.length - 1];
      if (!last || !last.trim()) {
        setOptionError("Please fill in the current option before adding another.");
        return;
      }
    }
    setOptionError(null);
    onChange([...options, ""]);
  };

  const deleteOption = (index: number) => {
    onChange(options.filter((_, i) => i !== index));
  };

  const updateOption = (index: number, val: string) => {
    if (optionError) setOptionError(null);
    const next = [...options];
    next[index] = val;
    onChange(next);
  };

  const applyReorder = (from: number, to: number) => {
    if (from === to) return;
    const next = [...options];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onChange(next);
  };

  /* ---- Mouse drag ---- */
  const handleDragStart = (index: number) => {
    dragIndexRef.current = index;
    setDraggingIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setOverIndex(index);
  };

  const handleDrop = () => {
    const from = dragIndexRef.current;
    if (from !== null && overIndex !== null) applyReorder(from, overIndex);
    dragIndexRef.current = null;
    setDraggingIndex(null);
    setOverIndex(null);
  };

  const handleDragEnd = () => {
    dragIndexRef.current = null;
    setDraggingIndex(null);
    setOverIndex(null);
  };

  /* ---- Touch drag ---- */
  const getIndexFromY = (clientY: number): number | null => {
    for (let i = 0; i < itemRefs.current.length; i++) {
      const el = itemRefs.current[i];
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      if (clientY >= rect.top && clientY <= rect.bottom) return i;
    }
    // clamp to edges
    const first = itemRefs.current[0]?.getBoundingClientRect();
    const last = itemRefs.current[itemRefs.current.length - 1]?.getBoundingClientRect();
    if (first && clientY < first.top) return 0;
    if (last && clientY > last.bottom) return itemRefs.current.length - 1;
    return null;
  };

  const handleTouchStart = (index: number) => {
    if (disabled) return;
    dragIndexRef.current = index;
    setDraggingIndex(index);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (dragIndexRef.current === null) return;
    e.preventDefault(); // prevent page scroll while dragging option
    const over = getIndexFromY(e.touches[0].clientY);
    if (over !== null) setOverIndex(over);
  };

  const handleTouchEnd = () => {
    const from = dragIndexRef.current;
    if (from !== null && overIndex !== null) applyReorder(from, overIndex);
    dragIndexRef.current = null;
    setDraggingIndex(null);
    setOverIndex(null);
  };

  return (
    <div className="mt-4 space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Dropdown Options
        </label>
        {!disabled && (
          <button
            type="button"
            onClick={addOption}
            className="flex items-center gap-1 text-xs text-purple-600 font-medium hover:text-purple-800 transition"
          >
            <Plus size={13} />
            Add Option
          </button>
        )}
      </div>

      {options.length === 0 && (
        <p className="text-xs text-gray-400 italic py-2 text-center border border-dashed rounded-xl">
          No options yet. Click "Add Option" to start.
        </p>
      )}

      {/* Container receives touchmove/touchend so events fire even as finger moves between rows */}
      <div
        ref={containerRef}
        className="space-y-2"
        onTouchMove={handleTouchMove as any}
        onTouchEnd={handleTouchEnd}
      >
        {options.map((opt, i) => (
          <div
            key={i}
            ref={(el) => { itemRefs.current[i] = el; }}
            draggable={!disabled}
            onDragStart={() => handleDragStart(i)}
            onDragOver={(e) => handleDragOver(e, i)}
            onDrop={handleDrop}
            onDragEnd={handleDragEnd}
            className={`flex items-center gap-2 bg-white border rounded-xl px-3 py-2 transition select-none
              ${overIndex === i && draggingIndex !== i ? "border-purple-400 bg-purple-50" : "border-gray-200"}
              ${draggingIndex === i ? "opacity-40" : "opacity-100"}
            `}
          >
            {/* DRAG HANDLE — touch events only on handle so inputs still work */}
            {!disabled && (
              <div
                className="touch-none cursor-grab flex-shrink-0 p-1 -ml-1"
                onTouchStart={() => handleTouchStart(i)}
              >
                <GripVertical size={15} className="text-gray-300" />
              </div>
            )}

            {/* OPTION NUMBER */}
            <span className="text-xs text-gray-400 w-5 flex-shrink-0 text-center">
              {i + 1}
            </span>

            {/* INPUT */}
            <input
              type="text"
              disabled={disabled}
              value={opt}
              onChange={(e) => updateOption(i, e.target.value)}
              placeholder={`Option ${i + 1}`}
              className={`flex-1 text-sm bg-transparent outline-none border-none focus:outline-none placeholder:text-gray-300
                ${disabled ? "cursor-not-allowed text-gray-400" : "text-gray-800"}
              `}
            />

            {/* DELETE */}
            {!disabled && (
              <button
                type="button"
                onClick={() => deleteOption(i)}
                className="text-gray-300 hover:text-red-400 transition flex-shrink-0"
              >
                <X size={14} />
              </button>
            )}
          </div>
        ))}

        {optionError && (
          <p className="text-xs text-red-500 mt-1">{optionError}</p>
        )}
      </div>
    </div>
  );
}

/* =======================================================
MAIN COMPONENT
======================================================= */
export default function ContactSection({
  value,
  disabled = false,
  onChange,
}: {
  value: ContactConfig;
  disabled?: boolean;
  onChange: (v: ContactConfig) => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const fields = value.fields ?? [];

  const updateField = (index: number, next: Partial<ContactField>) => {
    if (disabled) return;
    const updated = [...fields];
    updated[index] = { ...updated[index], ...next };
    onChange({ ...value, fields: updated });
  };

  const deleteField = (index: number) => {
    if (disabled) return;

    // Prevent removing the last field
    if (fields.length === 1) {
      setError("At least one field is required.");
      return;
    }

    const updated = fields
      .filter((_, i) => i !== index)
      .map((f, i) => ({ ...f, rank: i + 1 }));

    onChange({ ...value, fields: updated });
  };
  const addField = () => {
    if (disabled) return;
    const last = fields[fields.length - 1];
    if (last && (!last.label?.trim() || !last.type)) {
      setError("Please complete the previous field before adding another.");
      return;
    }
    setError(null);
    onChange({
      ...value,
      fields: [
        ...fields,
        {
          id: crypto.randomUUID(),
          type: "text",
          label: "",
          placeholder: "",
          required: false,
          enabled: true,
          rank: fields.length + 1,
          options: [],
        },
      ],
    });
  };

  return (
    <div className="space-y-6">
      {/* FORM TITLE */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Form Title</label>
        <input
          required
          disabled={disabled}
          value={value.form_title || ""}
          onChange={(e) => !disabled && onChange({ ...value, form_title: e.target.value })}
          className="w-full rounded-xl border px-4 py-3"
          placeholder="Enter a form title"
        />
      </div>

      {/* CONNECT BUTTON */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Connect Button Text</label>
        <input
          required
          disabled={disabled}
          value={value.connect_title || ""}
          onChange={(e) => !disabled && onChange({ ...value, connect_title: e.target.value })}
          className="w-full rounded-xl border px-4 py-3"
          placeholder="Enter a connect button text"
        />
      </div>

      {/* SAVE BUTTON */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Save Contact Button Text</label>
        <input
          required
          disabled={disabled}
          value={value.contact_title || ""}
          onChange={(e) => !disabled && onChange({ ...value, contact_title: e.target.value })}
          className="w-full rounded-xl border px-4 py-3"
          placeholder="Enter a Contact button text"
        />
      </div>

      {/* FIELDS */}
      <CommonItemsReorder
        items={fields}
        disabled={disabled}
        onChange={(reordered) =>
          onChange({ ...value, fields: reordered.map((f, i) => ({ ...f, rank: i + 1 })) })
        }
        renderItem={(field: ContactField, index: number) => (
          <div className="relative bg-gray-50 border rounded-xl p-5 shadow-sm space-y-4">
            {/* HEADER */}
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                {field.type} Field
              </span>
              <button
                type="button"
                disabled={disabled || fields.length === 1}
                onClick={() => deleteField(index)}
                className={`text-red-400 hover:text-red-600 transition 
${disabled || fields.length === 1 ? "opacity-40 cursor-not-allowed" : ""}`}             >
                <X size={16} />
              </button>
            </div>

            {/* LABEL */}
            <div className="space-y-1">
              <label className="text-xs text-gray-500">Label</label>
              <input
                disabled={disabled}
                value={field.label}
                onChange={(e) => updateField(index, { label: e.target.value })}
                placeholder="Enter a label name"
                className={`w-full rounded-xl border px-4 py-3 text-sm ${disabled ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-white"}`}
              />
            </div>

            {/* FIELD TYPE */}
            <div className="space-y-1">
              <label className="text-xs text-gray-500">Field Type</label>
              <SmartDropdown
                value={field.type}
                disabled={disabled}
                onChange={(val: any) =>
                  updateField(index, {
                    type: val,
                    options: val === "dropdown" ? (field.options ?? []) : undefined,
                  })
                }
              />
            </div>

            {/* DROPDOWN OPTIONS */}
            {field.type === "dropdown" && (
              <DropdownOptionsEditor
                options={field.options ?? []}
                disabled={disabled}
                onChange={(opts) => updateField(index, { options: opts })}
              />
            )}

            <div className="space-y-3">
              {/* ENABLED */}
              <div className="flex items-center justify-between">
                <Switch
                  label="Enabled"
                  value={field.enabled}
                  disabled={disabled}
                  onChange={(v) => updateField(index, { enabled: v })}
                />
              </div>

              {/* REQUIRED */}
              <div className="flex items-center justify-between">
                <Switch
                  label="Required"
                  value={field.required}
                  disabled={disabled || !field.enabled}
                  onChange={(v) => updateField(index, { required: v })}
                />
              </div>
            </div>
          </div>
        )}
      />

      {!disabled && (
        <button
          type="button"
          onClick={addField}
          className="w-full border rounded-xl py-3 text-sm font-medium hover:bg-gray-50"
        >
          + Add Another Field
        </button>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}