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
}: {
    value: string;
    onChange: (val: string) => void;
}) {
    const [open, setOpen] = useState(false);
    const [openUp, setOpenUp] = useState(false);

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

    /* ================= POSITION ================= */
    useEffect(() => {
        if (open && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;
            setOpenUp(spaceBelow < 200);
        }
    }, [open]);

    /* ================= OUTSIDE CLICK FIX ================= */
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

        const close = () => setOpen(false);

        document.addEventListener("mousedown", handleClickOutside);
        window.addEventListener("scroll", close, true);
        window.addEventListener("resize", close);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            window.removeEventListener("scroll", close, true);
            window.removeEventListener("resize", close);
        };
    }, [open]);

    const active =
        options.find((o) => o.id === value) || options[0];

    const rect = buttonRef.current?.getBoundingClientRect();

    return (
        <>
            <div ref={buttonRef} className="relative">
                <button
                    type="button"
                    onClick={() => setOpen((p) => !p)}
                    className="w-full flex items-center justify-between rounded-xl border px-4 py-3 bg-white"
                >
                    {active.label}
                    <ChevronDown
                        size={16}
                        className={`transition-transform ${open ? "rotate-180" : ""
                            }`}
                    />
                </button>
            </div>

            {open &&
                rect &&
                createPortal(
                    <div
                        ref={dropdownRef}
                        style={{
                            position: "fixed",
                            left: rect.left,
                            width: rect.width,
                            top: openUp
                                ? rect.top - 8
                                : rect.bottom + 8,
                            zIndex: 9999,
                        }}
                        className={`bg-white border rounded-xl shadow-lg overflow-hidden ${openUp ? "translate-y-[-100%]" : ""
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
                                className={`block w-full text-left px-4 py-2 hover:bg-gray-100 ${opt.id === value
                                        ? "bg-gray-100 font-medium"
                                        : ""
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
    disabled,
    onChange,
}: {
    value: ContactConfig;
    disabled?: boolean;
    onChange: (v: ContactConfig) => void;
}) {
    const [error, setError] = useState<string | null>(null);
    const fields = value.fields ?? [];

    /* ================= UPDATE ================= */

    const updateField = (
        index: number,
        next: Partial<ContactField>
    ) => {
        const updated = [...fields];
        updated[index] = { ...updated[index], ...next };

        onChange({
            ...value,
            fields: updated,
        });
    };

    /* ================= DELETE ================= */

    const deleteField = (index: number) => {
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

    /* ================= ADD ================= */

    const addField = () => {
        const last = fields[fields.length - 1];

        if (last && !last.label?.trim()) {
            setError(
                "Please complete the previous field before adding another."
            );
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

    /* ================= UI ================= */

    return (
        <div className="space-y-6">

            {/* FORM TITLE */}
            <div className="space-y-2">
                <label className="text-sm font-medium">
                    Form Title
                </label>
                <input
                    value={value.form_title || ""}
                    disabled={disabled}
                    onChange={(e) =>
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
                <label className="text-sm font-medium">
                    Connect Button Text
                </label>
                <input
                    value={value.connect_title || ""}
                    disabled={disabled}
                    onChange={(e) =>
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
                    value={value.contact_title || ""}
                    disabled={disabled}
                    onChange={(e) =>
                        onChange({
                            ...value,
                            contact_title: e.target.value,
                        })
                    }
                    className="w-full rounded-xl border px-4 py-3"
                />
            </div>

            {/* FORM FIELDS TITLE */}
            <div>
                <label className="text-sm font-semibold text-gray-700">
                    Form Fields
                </label>
            </div>
            {/* FIELDS */}
            <CommonItemsReorder
                items={fields}
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

                        {/* HEADER */}
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-xs text-gray-400">
                                {field.type.toUpperCase()} Field
                            </span>

                            <button
                                type="button"
                                onClick={() => deleteField(index)}
                                className="text-red-500 text-sm hover:text-red-700"
                            >
                                ✕
                            </button>
                        </div>

                        {/* LABEL */}
                        <div>
                            <label className="text-sm text-gray-500">
                                Label
                            </label>
                            <input
                                value={field.label}
                                onChange={(e) =>
                                    updateField(index, {
                                        label: e.target.value,
                                    })
                                }
                                className="w-full mt-1 rounded-xl border px-4 py-3"
                            />
                        </div>

                        {/* PLACEHOLDER */}
                        <div className="mt-4">
                            <label className="text-sm text-gray-500">
                                Placeholder
                            </label>
                            <input
                                value={field.placeholder || ""}
                                onChange={(e) =>
                                    updateField(index, {
                                        placeholder: e.target.value,
                                    })
                                }
                                className="w-full mt-1 rounded-xl border px-4 py-3"
                            />
                        </div>

                        {/* FIELD TYPE */}
                        <div className="mt-4">
                            <label className="text-sm text-gray-500">
                                Field Type
                            </label>

                            <SmartDropdown
                                value={field.type}
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

                        {/* DROPDOWN OPTIONS */}
                        {field.type === "dropdown" && (
                            <div className="mt-4 space-y-3">

                                <label className="block text-sm text-gray-500">
                                    Dropdown Options
                                </label>

                                {/* OPTIONS */}
                                {(field.options ?? []).map((opt, optIndex) => (
                                    <div key={optIndex} className="flex gap-2">
                                        <input
                                            value={opt}
                                            onChange={(e) => {
                                                const updated = [...(field.options ?? [])];
                                                updated[optIndex] = e.target.value;

                                                updateField(index, { options: updated });
                                            }}
                                            className="flex-1 rounded-xl border px-4 py-2"
                                        />

                                        <button
                                            type="button"
                                            onClick={() => {
                                                const updated = (field.options ?? []).filter(
                                                    (_, i) => i !== optIndex
                                                );

                                                updateField(index, { options: updated });
                                            }}
                                            className="text-red-500 text-sm"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ))}

                                {/* ADD OPTION BUTTON */}
                                <div className="pt-1">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            updateField(index, {
                                                options: [...(field.options ?? []), ""],
                                            })
                                        }
                                        className="text-sm text-blue-600 hover:underline"
                                    >
                                        + Add Option
                                    </button>
                                </div>

                            </div>
                        )}

                        {/* SWITCHES */}
                        <div className="flex gap-10 mt-4">
                            <Switch
                                label="Required"
                                value={field.required}
                                onChange={(v) =>
                                    updateField(index, {
                                        required: v,
                                    })
                                }
                            />

                            <Switch
                                label="Enabled"
                                value={field.enabled ?? true}
                                onChange={(v) =>
                                    updateField(index, {
                                        enabled: v,
                                    })
                                }
                            />
                        </div>
                    </div>
                )}
            />

            {error && (
                <p className="text-sm text-red-600">
                    {error}
                </p>
            )}

            {!disabled && (
                <button
                    type="button"
                    onClick={addField}
                    className="w-full border rounded-xl py-3 text-sm font-medium hover:bg-gray-50"
                >
                    + Add Another Field
                </button>
            )}
        </div>
    );
}