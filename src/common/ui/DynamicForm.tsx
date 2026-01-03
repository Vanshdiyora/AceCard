export interface FieldConfig {
  name: string;
  label: string;
  type: "text" | "number" | "email" | "select" | "textarea" | "date" | "checkbox" | "multiselect" | "radio" | "datetime";
  placeholder?: string;
  options?: { label: string; value: any }[];
}

interface DynamicFormProps {
  fields: FieldConfig[];
  form: any;
  onChange: (key: string, value: any) => void;
}
export default function DynamicForm({
  fields,
  form,
  onChange,
}: DynamicFormProps) {
  return (
    <div className="p-5 space-y-4 overflow-y-auto custom-scrollbar flex-1">

      {/* Base fields */}
      {fields.map((field) => (
        <div key={field.name} className="flex flex-col">
          <label className="text-sm font-medium capitalize mb-1">
            {field.label}
          </label>

          {/* TEXT / NUMBER / EMAIL / DATE */}
          {["text", "number", "email", "date"].includes(field.type) && (
            <input
              type={field.type}
              className="border rounded-lg w-full p-2 text-sm"
              placeholder={field.placeholder}
              value={form[field.name] ?? ""}
              onChange={(e) => onChange(field.name, e.target.value)}
            />
          )}

          {/* TEXTAREA */}
          {field.type === "textarea" && (
            <textarea
              rows={3}
              className="border rounded-lg w-full p-2 text-sm"
              placeholder={field.placeholder}
              value={form[field.name] ?? ""}
              onChange={(e) => onChange(field.name, e.target.value)}
            />
          )}

          {/* SELECT */}
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

          {/* RADIO */}
          {field.type === "radio" && (
            <div className="flex flex-col gap-2">
              {field.options?.map((opt) => (
                <label
                  key={opt.value}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="radio"
                    name={field.name}
                    value={opt.value}
                    checked={form[field.name] === opt.value}
                    onChange={() => onChange(field.name, opt.value)}
                    className="h-4 w-4"
                  />
                  <span className="text-sm">{opt.label}</span>
                </label>
              ))}
            </div>
          )}

          {/* MULTISELECT WITH CHECKBOXES */}
          {field.type === "multiselect" && (
            <div className="border rounded-lg p-2 space-y-1 max-h-40 overflow-y-auto">

              {/* Placeholder */}
              {(!form[field.name] || form[field.name].length === 0) && (
                <p className="text-xs text-gray-400 italic">
                  {field.placeholder || "Select one or more options"}
                </p>
              )}

              {field.options?.map((opt) => {
                const isSelected = (form[field.name] || []).includes(opt.value);

                return (
                  <label
                    key={opt.value}
                    className="flex items-center gap-2 p-1 rounded hover:bg-gray-100 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => {
                        let updatedValues = [...(form[field.name] || [])];

                        if (e.target.checked) {
                          updatedValues.push(opt.value);
                        } else {
                          updatedValues = updatedValues.filter((v) => v !== opt.value);
                        }

                        onChange(field.name, updatedValues);
                      }}
                      className="h-4 w-4"
                    />

                    <span className="text-sm">{opt.label}</span>
                  </label>
                );
              })}
            </div>
          )}

          {/* DATETIME */}
          {field.type === "datetime" && (
            <input
              type="datetime-local"
              className="border rounded-lg w-full p-2 text-sm"
              value={form[field.name] ?? ""}
              onChange={(e) => onChange(field.name, e.target.value)}
            />
          )}

          {/* CHECKBOX */}
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
    </div>
  );
}
