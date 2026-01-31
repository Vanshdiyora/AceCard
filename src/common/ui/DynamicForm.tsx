import React, { useState } from "react";
import BrandLoader from "./BrandLoader";
import SearchableSelect from "./SearchableSelect";
import { validateField } from "../utils/formValidator";
import CustomSelect from "./CustomSelect";

/* ---------- TYPES ---------- */

export interface FieldConfig {
  name: string;
  label: string;
  type:
  | "text"
  | "number"
  | "email"
  | "select"
  | "textarea"
  | "date"
  | "checkbox"
  | "multiselect"
  | "radio"
  | "datetime"
  | "search-select"
  | "search-multiselect"
  | "image";   // 👈 ADD

  placeholder?: string;
  options?: { label: string; value: any }[];

  /* ⭐ Validation */
  required?: boolean;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  minItems?: number;
  pattern?: RegExp;
  patternMessage?: string;
  validate?: (value: any, form: any) => string | null;

  /* UI */
  disabled?: boolean;
  onScrollEnd?: () => void;
  showLoader?: boolean;
  onSearch?: (value: string) => void;
  uppercase?: boolean;

  hideValues?: boolean; // ✅ ADD THIS LINE
  upload?: (file: File) => Promise<string>;
}


interface DynamicFormProps {
  fields: FieldConfig[];
  form: any;
  onChange: (key: string, value: any) => void;
  errors: Record<string, string | null>;
  setErrors: React.Dispatch<
    React.SetStateAction<Record<string, string | null>>
  >;
  noValidate?: boolean;
  disabled?: boolean;
}

/* ---------- STYLES ---------- */

const baseInputClass =
  "border border-gray-300 rounded-lg w-full min-w-0 max-w-full p-2 text-sm truncate box-border appearance-none " +
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 " +
  "focus-visible:ring-offset-2 focus-visible:ring-offset-white";

/* ---------- COMPONENT ---------- */

export default function DynamicForm({
  fields,
  form,
  onChange,
  errors,
  setErrors,
  noValidate = false,
  disabled = false,
}: DynamicFormProps) {
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  /* ---------- CHANGE HANDLER ---------- */
  const handleChange = (field: FieldConfig, value: any) => {
    // if (disabled || field.disabled) return;
    const finalValue =
      field.uppercase && typeof value === "string"
        ? value.toUpperCase()
        : value;

    onChange(field.name, finalValue);

    const error = validateField(
      field,
      finalValue,
      { ...form, [field.name]: finalValue }
    );

    setErrors((prev) => ({
      ...prev,
      [field.name]: error,
    }));
  };

  const handleBlur = (name: string) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  return (
    <form
      className="p-5 space-y-4 overflow-y-auto custom-scrollbar flex-1"
      noValidate={noValidate}
    >
      {fields.map((field) => {
        const error = errors[field.name];
        const showError = touched[field.name] && error;

        return (
          <div key={field.name} className="flex flex-col">
            <label className="text-sm font-medium mb-1">
              {field.label}
              {field.required && (
                <span className="text-red-500 ml-1">*</span>
              )}
            </label>

            {/* ---------- TEXT / EMAIL / DATE ---------- */}
            {["text", "email", "date"].includes(field.type) && (
              <>
                <input
                  type={field.type}
                  className={`${baseInputClass} ${showError ? "border-red-500" : ""
                    }`}
                  placeholder={field.placeholder}
                  value={form[field.name] ?? ""}
                  onChange={(e) =>
                    handleChange(field, e.target.value)
                  }
                  onBlur={() => handleBlur(field.name)}
                />
                {showError && (
                  <p className="text-xs text-red-500 mt-1">{error}</p>
                )}
              </>
            )}

            {/* ---------- NUMBER ---------- */}
            {field.type === "number" && (
              <>
                <input
                  type="number"
                  className={`${baseInputClass} ${showError ? "border-red-500" : ""
                    }`}
                  value={form[field.name] ?? ""}
                  onChange={(e) =>
                    handleChange(
                      field,
                      e.target.value === ""
                        ? ""
                        : Number(e.target.value)
                    )
                  }
                  onBlur={() => handleBlur(field.name)}
                />
                {showError && (
                  <p className="text-xs text-red-500 mt-1">{error}</p>
                )}
              </>
            )}

            {/* ---------- TEXTAREA ---------- */}
            {field.type === "textarea" && (
              <>
                <textarea
                  rows={3}
                  className={`${baseInputClass} ${showError ? "border-red-500" : ""
                    }`}
                  value={form[field.name] ?? ""}
                  onChange={(e) =>
                    handleChange(field, e.target.value)
                  }
                  onBlur={() => handleBlur(field.name)}
                />
                {showError && (
                  <p className="text-xs text-red-500 mt-1">{error}</p>
                )}
              </>
            )}

            {/* ---------- SELECT ---------- */}
            {field.type === "select" && (
              <>
                <CustomSelect
                  value={form[field.name]}
                  options={field.options || []}
                  placeholder={`Select ${field.label}`}
                  disabled={field.disabled}
                  onChange={(v) => handleChange(field, v)}
                />

                {showError && (
                  <p className="text-xs text-red-500 mt-1">{error}</p>
                )}
              </>
            )}

            {/* ---------- MULTISELECT ---------- */}
            {field.type === "multiselect" && (
              <>
                <div
                  className={`border rounded-lg p-2 max-h-40 overflow-y-auto ${showError ? "border-red-500" : ""
                    }`}
                  onBlur={() => handleBlur(field.name)}
                >
                  {field.options?.map((opt) => {
                    const selected =
                      (form[field.name] || []).includes(opt.value);

                    return (
                      <label
                        key={opt.value}
                        className="flex items-center gap-2"
                      >
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={(e) => {
                            const current =
                              form[field.name] || [];
                            const updated = e.target.checked
                              ? [...current, opt.value]
                              : current.filter(
                                (v: any) => v !== opt.value
                              );
                            handleChange(field, updated);
                          }}
                        />
                        <span className="text-sm">{opt.label}</span>
                      </label>
                    );
                  })}

                  {field.showLoader && (
                    <div className="flex justify-center py-2">
                      <BrandLoader />
                    </div>
                  )}
                </div>

                {showError && (
                  <p className="text-xs text-red-500 mt-1">{error}</p>
                )}
              </>
            )}

            {/* ---------- SEARCH SELECT ---------- */}
            {field.type === "search-select" && (
              <>
                <SearchableSelect
                  value={form[field.name]}
                  options={field.options || []}
                  onChange={(v) => handleChange(field, v)}
                  onSearch={field.onSearch}
                  loading={field.showLoader}
                  disabled={disabled || field.disabled}
                  placeholder={`Select ${field.label}`}
                />
                {showError && (
                  <p className="text-xs text-red-500 mt-1">{error}</p>
                )}
              </>
            )}

            {/* ---------- SEARCH MULTISELECT ---------- */}
            {field.type === "search-multiselect" && (
              <>
                <SearchableSelect
                  multiple
                  value={form[field.name] || []}
                  options={field.options || []}
                  onChange={(v) => handleChange(field, v)}
                  onSearch={field.onSearch}
                  loading={field.showLoader}
                  disabled={field.disabled}
                  placeholder={`Select ${field.label}`}
                  hideValues={field.hideValues ?? field.name === "product_ids"}
                />

                {showError && (
                  <p className="text-xs text-red-500 mt-1">{error}</p>
                )}
              </>
            )}

            {/* ---------- CHECKBOX ---------- */}
            {field.type === "checkbox" && (
              <>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={!!form[field.name]}
                    onChange={(e) =>
                      handleChange(field, e.target.checked)
                    }
                    onBlur={() => handleBlur(field.name)}
                  />
                  <span className="text-sm">{field.label}</span>
                </div>
                {showError && (
                  <p className="text-xs text-red-500 mt-1">{error}</p>
                )}
              </>
            )}

            {/* ---------- IMAGE ---------- */}
            {field.type === "image" && (
              <>
                <div className="flex items-center gap-4">
                  {/* AVATAR PREVIEW */}
                  <div
                    className={`relative w-28 h-28 rounded-full border overflow-hidden bg-gray-100 flex items-center justify-center ${disabled || field.disabled
                        ? "opacity-60 pointer-events-none"
                        : ""
                      }`}
                  >
                    {form[field.name] ? (
                      <img
                        src={form[field.name]}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-xs text-gray-400 text-center px-2">
                        No avatar
                      </span>
                    )}

                    {/* OVERLAY */}
                    <label className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 hover:opacity-100 cursor-pointer transition">
                      Change
                      <input
                        type="file"
                        hidden
                        accept="image/*"
                        disabled={disabled || field.disabled}
                        onChange={async (e) => {
                          if (!e.target.files?.[0] || !field.upload) return;
                          const url = await field.upload(e.target.files[0]);
                          handleChange(field, url);
                        }}
                      />
                    </label>
                  </div>

                  {/* TEXT */}
                  <div className="text-sm text-gray-500">
                    Click to upload a profile image
                  </div>
                </div>

                {showError && (
                  <p className="text-xs text-red-500 mt-1">{error}</p>
                )}
              </>
            )}


          </div>
        );
      })}
    </form>
  );
}
