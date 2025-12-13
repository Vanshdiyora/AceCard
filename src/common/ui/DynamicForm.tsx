export interface FieldConfig {
  name: string;
  label: string;
  type: "text" | "number" | "email" | "select" | "textarea" | "date" | "checkbox";
  placeholder?: string;
  options?: { label: string; value: any }[];
}

interface DynamicFormProps {
  fields: FieldConfig[];
  form: any;
  onChange: (key: string, value: any) => void;

  // Optional extra properties
  extraProps?: { key: string; value: string }[];
  onExtraChange?: (index: number, field: "key" | "value", value: string) => void;
  onExtraAdd?: () => void;
  onExtraRemove?: (index: number) => void;
}

export default function DynamicForm({
  fields,
  form,
  onChange,
  extraProps,
  onExtraChange,
  onExtraAdd,
  onExtraRemove
}: DynamicFormProps) {
  return (
    <div className="p-5 space-y-4 overflow-y-auto custom-scrollbar flex-1">

      {/* Base fields */}
      {fields.map((field) => (
        <div key={field.name} className="flex flex-col">
          <label className="text-sm font-medium capitalize mb-1">
            {field.label}
          </label>

          {["text", "number", "email", "date"].includes(field.type) && (
            <input
              type={field.type}
              className="border rounded-lg w-full p-2 text-sm"
              placeholder={field.placeholder}
              value={form[field.name] ?? ""}
              onChange={(e) => onChange(field.name, e.target.value)}
            />
          )}

          {field.type === "textarea" && (
            <textarea
              rows={3}
              className="border rounded-lg w-full p-2 text-sm"
              placeholder={field.placeholder}
              value={form[field.name] ?? ""}
              onChange={(e) => onChange(field.name, e.target.value)}
            />
          )}

          {field.type === "select" && (
            <select
              className="border rounded-lg w-full p-2 text-sm"
              value={form[field.name] ?? ""}
              onChange={(e) => onChange(field.name, e.target.value)}
            >
              <option value="">Select {field.label}</option>
              {field.options?.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          )}

          {field.type === "checkbox" && (
            <input
              type="checkbox"
              className="h-4 w-4"
              checked={!!form[field.name]}
              onChange={(e) => onChange(field.name, e.target.checked)}
            />
          )}
        </div>
      ))}

      {/* Extra Properties Section (optional) */}
      {extraProps && (
        <div className="mt-4">
          <h3 className="font-medium mb-2">Extra Properties</h3>

          {extraProps.map((prop, idx) => (
            <div key={idx} className="flex items-center gap-2 mb-2">

              <input
                placeholder="Field name"
                value={prop.key}
                onChange={(e) => onExtraChange?.(idx, "key", e.target.value)}
                className="border rounded-lg px-3 py-2 w-1/2"
              />

              <input
                placeholder="Value"
                value={prop.value}
                onChange={(e) => onExtraChange?.(idx, "value", e.target.value)}
                className="border rounded-lg px-3 py-2 w-1/2"
              />

              {extraProps.length > 1 && (
                <button
                  className="text-red-500"
                  onClick={() => onExtraRemove?.(idx)}
                >
                  ✕
                </button>
              )}
            </div>
          ))}

          <button 
            onClick={onExtraAdd} 
            className="text-purple-600 font-medium"
          >
            + Add another field
          </button>
        </div>
      )}

    </div>
  );
}
