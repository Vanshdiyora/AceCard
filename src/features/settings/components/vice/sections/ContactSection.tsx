import { useState, useRef, useEffect } from "react";
import { Switch } from "../VicePublicSetting";
import type { ContactConfig, ContactField } from "../VicePublicSetting";
import { createPortal } from "react-dom";
import CommonItemsReorder from "./CommonItemsReorder";
import { ChevronDown } from "lucide-react";

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
  const [position, setPosition] = useState({
    left: 0,
    width: 0,
    top: 0,
  });

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

    if (left + width > viewportWidth - 8) {
      left = viewportWidth - width - 8;
    }

    if (left < 8) {
      left = 8;
    }

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

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (
        buttonRef.current?.contains(target) ||
        dropdownRef.current?.contains(target)
      ) {
        return;
      }

      setOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const active = options.find((o) => o.id === value) || options[0];

  return (
    <>
      <div ref={buttonRef}>
        <button
          type="button"
          disabled={disabled}
          onClick={() => {
            if (disabled) return;
            setOpen((p) => !p);
          }}
          className={`w-full flex items-center justify-between rounded-xl border px-4 py-3 bg-white ${
            disabled ? "opacity-60 cursor-not-allowed" : ""
          }`}
        >
          {active.label}
          <ChevronDown
            size={16}
            className={`transition-transform ${open ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      {!disabled &&
        open &&
        createPortal(
          <div
            ref={dropdownRef}
            style={{
              position: "fixed",
              left: position.left,
              width: position.width,
              top: position.top,
              zIndex: 9999,
            }}
            className={`bg-white border rounded-xl shadow-lg max-h-60 overflow-auto ${
              openUp ? "translate-y-[-100%]" : ""
            }`}
          >
            {options.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  onChange(opt.id);
                  setOpen(false);
                }}
                className={`block w-full text-left px-4 py-2 hover:bg-gray-100 ${
                  opt.id === value ? "bg-gray-100 font-medium" : ""
                }`}
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

  const updateField = (
    index: number,
    next: Partial<ContactField>
  ) => {
    if (disabled) return;

    const updated = [...fields];
    updated[index] = { ...updated[index], ...next };

    onChange({
      ...value,
      fields: updated,
    });
  };

  const deleteField = (index: number) => {
    if (disabled) return;

    const updated = fields
      .filter((_, i) => i !== index)
      .map((f, i) => ({
        ...f,
        rank: i + 1,
      }));

    onChange({
      ...value,
      fields: updated,
    });
  };

  const addField = () => {
    if (disabled) return;

    const last = fields[fields.length - 1];

    if (last && !last.label?.trim()) {
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
          disabled={disabled}
          value={value.form_title || ""}
          onChange={(e) =>
            !disabled &&
            onChange({
              ...value,
              form_title: e.target.value,
            })
          }
          className="w-full rounded-xl border px-4 py-3"
        />
      </div>

      {/* CONNECT BUTTON */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Connect Button Text</label>
        <input
          disabled={disabled}
          value={value.connect_title || ""}
          onChange={(e) =>
            !disabled &&
            onChange({
              ...value,
              connect_title: e.target.value,
            })
          }
          className="w-full rounded-xl border px-4 py-3"
        />
      </div>

      {/* SAVE BUTTON */}
      <div className="space-y-2">
        <label className="text-sm font-medium">
          Save Contact Button Text
        </label>
        <input
          disabled={disabled}
          value={value.contact_title || ""}
          onChange={(e) =>
            !disabled &&
            onChange({
              ...value,
              contact_title: e.target.value,
            })
          }
          className="w-full rounded-xl border px-4 py-3"
        />
      </div>

      {/* FIELDS */}
      <CommonItemsReorder
        items={fields}
        disabled={disabled}
        onChange={(reordered) =>
          onChange({
            ...value,
            fields: reordered.map((f, i) => ({
              ...f,
              rank: i + 1,
            })),
          })
        }
        renderItem={(field: ContactField, index: number) => (
          <div className="relative bg-gray-50 border rounded-xl p-5 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs text-gray-400">
                {field.type.toUpperCase()} Field
              </span>

              <button
                type="button"
                disabled={disabled}
                onClick={() => deleteField(index)}
                className={`text-red-500 text-sm ${
                  disabled ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                ✕
              </button>
            </div>

            <input
              disabled={disabled}
              value={field.label}
              onChange={(e) =>
                updateField(index, { label: e.target.value })
              }
              className="w-full mt-1 rounded-xl border px-4 py-3"
            />

            <div className="mt-4">
              <SmartDropdown
                value={field.type}
                disabled={disabled}
                onChange={(val: any) =>
                  updateField(index, {
                    type: val,
                    options:
                      val === "dropdown"
                        ? field.options ?? []
                        : undefined,
                  })
                }
              />
            </div>

            <div className="mt-4">
              <Switch
                label="Required"
                value={field.required}
                disabled={disabled}
                onChange={(v) =>
                  updateField(index, { required: v })
                }
              />
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

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}