import { useState } from "react";

/* ---------------------------------------------
   TYPES
--------------------------------------------- */

type RequiredFields = {
  name: boolean;
  phone: boolean;
  email: boolean;
  product: boolean;
};

type FieldType =
  | "text"
  | "dropdown"
  | "radio"
  | "checkbox"
  | "datetime";

type Option = {
  label: string;
  value: string;
};

type CustomField = {
  fieldId: string;
  label: string;
  type: FieldType;
  required: boolean;
  archived: boolean;
  options?: Option[];
};

const requiredKeys = ["name", "phone", "email", "product"] as const;

/* ---------------------------------------------
   COMPONENT
--------------------------------------------- */

export default function LeadConfiguration() {
  /* ---------------- Mandatory Fields ---------------- */
  const [required, setRequired] = useState<RequiredFields>({
    name: true,
    phone: true,
    email: false,
    product: false,
  });

  /* ---------------- Lead Stages ---------------- */
  const [stages, setStages] = useState<string[]>([
    "New",
    "Contacted",
    "Qualified",
    "Won",
  ]);
  const [newStage, setNewStage] = useState("");

  /* ---------------- Custom Fields ---------------- */
  const [customFields, setCustomFields] = useState<CustomField[]>([]);

  const [label, setLabel] = useState("");
  const [type, setType] = useState<FieldType>("text");
  const [requiredField, setRequiredField] = useState(false);

  /* ---------------- Options (for choice fields) ---------------- */
  const [optionInput, setOptionInput] = useState("");
  const [options, setOptions] = useState<Option[]>([]);

  const isChoiceField =
    type === "dropdown" || type === "radio" || type === "checkbox";

  /* ---------------- Add Option ---------------- */
  const addOption = () => {
    if (!optionInput.trim()) return;

    setOptions((prev) => [
      ...prev,
      {
        label: optionInput,
        value: optionInput.toLowerCase().replace(/\s+/g, "_"),
      },
    ]);
    setOptionInput("");
  };

  /* ---------------- Add Custom Field ---------------- */
  const addCustomField = () => {
    if (!label.trim()) return;
    if (isChoiceField && options.length === 0) return;

    setCustomFields((prev) => [
      ...prev,
      {
        fieldId: label.toLowerCase().replace(/\s+/g, "_"),
        label,
        type,
        required: requiredField,
        archived: false,
        options: isChoiceField ? options : undefined,
      },
    ]);

    // Reset
    setLabel("");
    setType("text");
    setRequiredField(false);
    setOptions([]);
    setOptionInput("");
  };

  /* ---------------- Save Configuration ---------------- */
  const saveConfiguration = async () => {
    const payload = {
      mandatoryFields: required,
      stages: stages.map((s) => ({
        label: s,
        value: s.toLowerCase().replace(/\s+/g, "_"),
      })),
      customFields,
    };

    await fetch("/vendor/lead-form-config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    alert("Configuration saved successfully");
  };

  /* ---------------------------------------------
     UI
  --------------------------------------------- */

  return (
    <div className="bg-white shadow p-8 rounded-xl border max-w-3xl">
      <h2 className="text-xl font-semibold mb-6">Lead Configuration</h2>

      {/* ---------------- Mandatory Fields ---------------- */}
      <h3 className="font-semibold mb-3">Mandatory Fields</h3>
      <div className="space-y-2 mb-6">
        {requiredKeys.map((key) => (
          <label key={key} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={required[key]}
              onChange={() =>
                setRequired((prev) => ({
                  ...prev,
                  [key]: !prev[key],
                }))
              }
            />
            {key.toUpperCase()}
          </label>
        ))}
      </div>

      {/* ---------------- Lead Stages ---------------- */}
      <h3 className="font-semibold mb-3">Lead Stages</h3>
      <div className="space-y-2 mb-4">
        {stages.map((stage) => (
          <div
            key={stage}
            className="flex items-center justify-between px-4 py-2 border rounded-lg"
          >
            <span>{stage}</span>
            <button
              className="text-red-500"
              onClick={() =>
                setStages((prev) => prev.filter((s) => s !== stage))
              }
            >
              Delete
            </button>
          </div>
        ))}
      </div>

      <div className="flex gap-2 mb-6">
        <input
          className="border rounded-lg px-3 py-2 flex-1"
          placeholder="New Stage"
          value={newStage}
          onChange={(e) => setNewStage(e.target.value)}
        />
        <button
          className="px-6 py-2 bg-purple-600 text-white rounded-lg"
          onClick={() => {
            if (newStage.trim()) {
              setStages((prev) => [...prev, newStage.trim()]);
              setNewStage("");
            }
          }}
        >
          Add
        </button>
      </div>

      {/* ---------------- Custom Fields ---------------- */}
      <h3 className="font-semibold mb-3">Custom Fields</h3>

      <div className="space-y-3 mb-4">
        {customFields.map((field, i) => (
          <div
            key={i}
            className={`border rounded-lg p-4 flex justify-between ${
              field.archived ? "opacity-50" : ""
            }`}
          >
            <div>
              <div className="font-medium">{field.label}</div>
              <div className="text-sm text-gray-500">
                {field.type} {field.required && "(Required)"}
              </div>
            </div>

            {!field.archived && (
              <button
                className="text-red-500"
                onClick={() =>
                  setCustomFields((prev) =>
                    prev.map((f, idx) =>
                      idx === i ? { ...f, archived: true } : f
                    )
                  )
                }
              >
                Archive
              </button>
            )}
          </div>
        ))}
      </div>

      {/* ---------------- Add Custom Field ---------------- */}
      <div className="border rounded-lg p-4 mb-8 space-y-3">
        <input
          className="border rounded px-3 py-2 w-full"
          placeholder="Field Label"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
        />

        <select
          className="border rounded px-3 py-2 w-full"
          value={type}
          onChange={(e) => setType(e.target.value as FieldType)}
        >
          <option value="text">Text Input</option>
          <option value="dropdown">Dropdown</option>
          <option value="radio">Multi Choice (Radio)</option>
          <option value="checkbox">Checkboxes</option>
          <option value="datetime">Date & Time</option>
        </select>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={requiredField}
            onChange={() => setRequiredField((p) => !p)}
          />
          Required
        </label>

        {/* -------- Options -------- */}
        {isChoiceField && (
          <div className="border rounded p-3 space-y-2">
            <div className="font-medium text-sm">Options</div>

            {options.map((o, i) => (
              <div
                key={i}
                className="flex justify-between text-sm border px-3 py-1 rounded"
              >
                {o.label}
                <button
                  className="text-red-500"
                  onClick={() =>
                    setOptions((prev) => prev.filter((_, idx) => idx !== i))
                  }
                >
                  ✕
                </button>
              </div>
            ))}

            <div className="flex gap-2">
              <input
                className="border rounded px-3 py-1 flex-1"
                placeholder="Option label"
                value={optionInput}
                onChange={(e) => setOptionInput(e.target.value)}
              />
              <button
                className="px-3 py-1 bg-gray-700 text-white rounded"
                onClick={addOption}
              >
                Add
              </button>
            </div>
          </div>
        )}

        <button
          className="px-4 py-2 bg-gray-800 text-white rounded"
          onClick={addCustomField}
        >
          Add Field
        </button>
      </div>

      {/* ---------------- Save ---------------- */}
      <button
        className="px-6 py-2 bg-purple-600 text-white rounded-lg"
        onClick={saveConfiguration}
      >
        Save Configuration
      </button>
    </div>
  );
}
