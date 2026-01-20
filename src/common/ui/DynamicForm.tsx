import BrandLoader from "./BrandLoader";
import { validateField } from "../utils/formValidator";
import React, { useState } from "react";

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
    | "datetime";

  placeholder?: string;
  options?: { label: string; value: any }[];

  /* ⭐ Validation */
  required?: boolean;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  validate?: (value: any, form: any) => string | null;

  /* UI */
  disabled?: boolean;
  onScrollEnd?: () => void;
  showLoader?: boolean;
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
}

const baseInputClass =
  "border border-gray-300 rounded-lg w-full min-w-0 max-w-full p-2 text-sm truncate box-border appearance-none " +
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 " +
  "focus-visible:ring-offset-2 focus-visible:ring-offset-white";

export default function DynamicForm({
  fields,
  form,
  onChange,
  errors,
  setErrors,
  noValidate = false,
}: DynamicFormProps) {
  /* 🧠 Track which fields were touched (blurred) */
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  /* 🔁 Update value + pre-validate (no UI yet) */
  const handleChange = (field: FieldConfig, value: any) => {
    onChange(field.name, value);

    const error = validateField(
      field,
      value,
      { ...form, [field.name]: value }
    );

    setErrors((prev) => ({
      ...prev,
      [field.name]: error,
    }));
  };

  /* 🎯 Mark field as touched on blur */
  const handleBlur = (name: string) => {
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));
  };

  return (
    <form
      className="p-5 space-y-4 overflow-y-auto overflow-x-visible custom-scrollbar flex-1"
      noValidate={noValidate}
    >
      {fields.map((field) => {
        const error = errors[field.name];
        const showError = touched[field.name] && error;

        return (
          <div
            key={field.name}
            className="flex flex-col min-w-0 overflow-visible"
          >
            <label className="text-sm font-medium capitalize mb-1 truncate">
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
                  className={`${baseInputClass} ${
                    showError ? "border-red-500" : ""
                  }`}
                  placeholder={field.placeholder}
                  value={form[field.name] ?? ""}
                  onChange={(e) =>
                    handleChange(field, e.target.value)
                  }
                  onBlur={() => handleBlur(field.name)}
                />
                {showError && (
                  <p className="text-xs text-red-500 mt-1">
                    {error}
                  </p>
                )}
              </>
            )}

            {/* ---------- NUMBER ---------- */}
            {field.type === "number" && (
              <>
                <input
                  type="number"
                  inputMode="numeric"
                  className={`${baseInputClass} no-spinner ${
                    showError ? "border-red-500" : ""
                  }`}
                  placeholder={field.placeholder}
                  value={
                    form[field.name] === 0
                      ? ""
                      : form[field.name] ?? ""
                  }
                  onChange={(e) => {
                    const val = e.target.value;
                    handleChange(
                      field,
                      val === "" ? "" : Number(val)
                    );
                  }}
                  onBlur={() => handleBlur(field.name)}
                />
                {showError && (
                  <p className="text-xs text-red-500 mt-1">
                    {error}
                  </p>
                )}
              </>
            )}

            {/* ---------- TEXTAREA ---------- */}
            {field.type === "textarea" && (
              <>
                <textarea
                  rows={3}
                  className={`${baseInputClass} resize-none ${
                    showError ? "border-red-500" : ""
                  }`}
                  placeholder={field.placeholder}
                  value={form[field.name] ?? ""}
                  onChange={(e) =>
                    handleChange(field, e.target.value)
                  }
                  onBlur={() => handleBlur(field.name)}
                />
                {showError && (
                  <p className="text-xs text-red-500 mt-1">
                    {error}
                  </p>
                )}
              </>
            )}

            {/* ---------- SELECT ---------- */}
            {field.type === "select" && (
              <>
                <div className="relative w-full max-w-full">
                  {field.disabled ? (
                    <div className="border rounded-lg p-2 flex items-center justify-center">
                      <BrandLoader />
                    </div>
                  ) : (
                    <>
                      <select
                        className={`${baseInputClass} ${
                          showError ? "border-red-500" : ""
                        }`}
                        value={form[field.name] ?? ""}
                        onChange={(e) =>
                          handleChange(field, e.target.value)
                        }
                        onBlur={() => handleBlur(field.name)}
                      >
                        <option value="">
                          Select {field.label}
                        </option>
                        {field.options?.map((opt) => (
                          <option
                            key={opt.value}
                            value={opt.value}
                          >
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs opacity-60">
                        ▼
                      </span>
                    </>
                  )}
                </div>
                {showError && (
                  <p className="text-xs text-red-500 mt-1">
                    {error}
                  </p>
                )}
              </>
            )}

            {/* ---------- RADIO ---------- */}
            {field.type === "radio" && (
              <>
                <div
                  className="flex flex-col gap-2"
                  onBlur={() => handleBlur(field.name)}
                >
                  {field.options?.map((opt) => (
                    <label
                      key={opt.value}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name={field.name}
                        checked={form[field.name] === opt.value}
                        onChange={() =>
                          handleChange(field, opt.value)
                        }
                      />
                      <span className="text-sm">
                        {opt.label}
                      </span>
                    </label>
                  ))}
                </div>
                {showError && (
                  <p className="text-xs text-red-500 mt-1">
                    {error}
                  </p>
                )}
              </>
            )}

            {/* ---------- MULTISELECT ---------- */}
            {field.type === "multiselect" && (
              <>
                <div
                  className={`border rounded-lg p-2 space-y-1 max-h-40 overflow-y-auto ${
                    showError ? "border-red-500" : ""
                  }`}
                  onBlur={() => handleBlur(field.name)}
                >
                  {field.options?.map((opt) => {
                    const isSelected = (
                      form[field.name] || []
                    ).includes(opt.value);

                    return (
                      <label
                        key={opt.value}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            let updated = [
                              ...(form[field.name] || []),
                            ];
                            if (e.target.checked)
                              updated.push(opt.value);
                            else
                              updated = updated.filter(
                                (v) => v !== opt.value
                              );
                            handleChange(field, updated);
                          }}
                        />
                        <span className="text-sm">
                          {opt.label}
                        </span>
                      </label>
                    );
                  })}
                </div>
                {showError && (
                  <p className="text-xs text-red-500 mt-1">
                    {error}
                  </p>
                )}
              </>
            )}

            {/* ---------- DATETIME ---------- */}
            {field.type === "datetime" && (
              <>
                <input
                  type="datetime-local"
                  className={`${baseInputClass} ${
                    showError ? "border-red-500" : ""
                  }`}
                  value={form[field.name] ?? ""}
                  onChange={(e) =>
                    handleChange(field, e.target.value)
                  }
                  onBlur={() => handleBlur(field.name)}
                />
                {showError && (
                  <p className="text-xs text-red-500 mt-1">
                    {error}
                  </p>
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
                  <span className="text-sm">
                    {field.label}
                  </span>
                </div>
                {showError && (
                  <p className="text-xs text-red-500 mt-1">
                    {error}
                  </p>
                )}
              </>
            )}
          </div>
        );
      })}
    </form>
  );
}
