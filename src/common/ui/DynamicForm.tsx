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
}

interface DynamicFormProps {
  fields: FieldConfig[];
  form: any;
  onChange: (key: string, value: any) => void;
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
  noValidate = false,
}: DynamicFormProps) {
  return (
    <form
      className="p-5 space-y-4 overflow-y-auto overflow-x-visible custom-scrollbar flex-1"
      noValidate={noValidate}
    >
      {fields.map((field) => (
        <div
          key={field.name}
          className="flex flex-col min-w-0 overflow-visible"
        >
          <label className="text-sm font-medium capitalize mb-1 truncate">
            {field.label}
          </label>

          {["text", "email", "date"].includes(field.type) && (
            <input
              type={field.type}
              className={baseInputClass}
              placeholder={field.placeholder}
              value={form[field.name] ?? ""}
              onChange={(e) => onChange(field.name, e.target.value)}
            />
          )}

          {field.type === "number" && (
            <input
              type="number"
              inputMode="numeric"
              className={`${baseInputClass} no-spinner`}
              placeholder={field.placeholder}
              value={form[field.name] === 0 ? "" : form[field.name] ?? ""}
              onChange={(e) => {
                const val = e.target.value;
                onChange(field.name, val === "" ? "" : Number(val));
              }}
            />
          )}

          {field.type === "textarea" && (
            <textarea
              rows={3}
              className={`${baseInputClass} resize-none`}
              placeholder={field.placeholder}
              value={form[field.name] ?? ""}
              onChange={(e) => onChange(field.name, e.target.value)}
            />
          )}

          {field.type === "select" && (
            <div className="relative w-full max-w-full">
              <select
                className={baseInputClass}
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

              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs opacity-60">
                ▼
              </span>
            </div>
          )}

          {field.type === "radio" && (
            <div className="flex flex-col gap-2">
              {field.options?.map((opt) => (
                <label
                  key={opt.value}
                  className="flex items-center gap-2 cursor-pointer truncate"
                >
                  <input
                    type="radio"
                    name={field.name}
                    value={opt.value}
                    checked={form[field.name] === opt.value}
                    onChange={() => onChange(field.name, opt.value)}
                    className="h-4 w-4 shrink-0 focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2"
                  />
                  <span className="text-sm truncate">{opt.label}</span>
                </label>
              ))}
            </div>
          )}

          {field.type === "multiselect" && (
            <div className="border rounded-lg p-2 space-y-1 max-h-40 overflow-y-auto overflow-x-hidden">
              {(!form[field.name] || form[field.name].length === 0) && (
                <p className="text-xs text-gray-400 italic truncate">
                  {field.placeholder || "Select one or more options"}
                </p>
              )}

              {field.options?.map((opt) => {
                const isSelected = (form[field.name] || []).includes(opt.value);

                return (
                  <label
                    key={opt.value}
                    className="flex items-center gap-2 p-1 rounded hover:bg-gray-100 cursor-pointer overflow-hidden"
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => {
                        let updatedValues = [...(form[field.name] || [])];

                        if (e.target.checked) {
                          updatedValues.push(opt.value);
                        } else {
                          updatedValues = updatedValues.filter(
                            (v) => v !== opt.value
                          );
                        }

                        onChange(field.name, updatedValues);
                      }}
                      className="h-4 w-4 shrink-0 focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2"
                    />

                    <span className="text-sm truncate">{opt.label}</span>
                  </label>
                );
              })}
            </div>
          )}

          {field.type === "datetime" && (
            <input
              type="datetime-local"
              className={baseInputClass}
              value={form[field.name] ?? ""}
              onChange={(e) => onChange(field.name, e.target.value)}
            />
          )}

          {field.type === "checkbox" && (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                className="h-4 w-4 shrink-0 focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2"
                checked={!!form[field.name]}
                onChange={(e) => onChange(field.name, e.target.checked)}
              />
              <span className="text-sm truncate">{field.label}</span>
            </div>
          )}
        </div>
      ))}
    </form>
  );
}
