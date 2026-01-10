import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { fetchLeadConfig, saveLeadConfig } from "../slice";
import type {
  RequiredFields,
  CustomField,
  FieldType,
  Option,
} from "../types";

const requiredKeys = ["name", "phone", "email", "product"] as const;

const DEFAULT_REQUIRED: RequiredFields = {
  name: true,
  phone: true,
  email: true,
  product: true,
};

const DEFAULT_STAGES = ["New", "Contacted", "Qualified", "Converted", "Lost"];

export default function LeadConfiguration() {
  const dispatch = useAppDispatch();
  const { data, loading, saving, error } = useAppSelector(
    (s) => s.settings.leadConfig
  );

  const [required, setRequired] = useState<RequiredFields>(DEFAULT_REQUIRED);
  const [stages, setStages] = useState<string[]>(DEFAULT_STAGES);
  const [customFields, setCustomFields] = useState<CustomField[]>([]);

  const [newStage, setNewStage] = useState("");
  const [fieldLabel, setFieldLabel] = useState("");
  const [type, setType] = useState<FieldType>("text");
  const [requiredField, setRequiredField] = useState(false);

  const [optionInput, setOptionInput] = useState("");
  const [options, setOptions] = useState<Option[]>([]);

  const isChoiceField =
    type === "dropdown" || type === "radio" || type === "checkbox";

  useEffect(() => {
    dispatch(fetchLeadConfig());
  }, [dispatch]);

  useEffect(() => {
    if (!data) return;
    setCustomFields(data.customFields ?? []);
  }, [data]);

  const resetConfiguration = () => {
    setCustomFields(data?.customFields ?? []);
    setStages(DEFAULT_STAGES);
    setRequired(DEFAULT_REQUIRED);
    setNewStage("");
    setFieldLabel("");
    setType("text");
    setRequiredField(false);
    setOptions([]);
    setOptionInput("");
  };

  const addOption = () => {
    if (!optionInput.trim()) return;
    setOptions((p) => [
      ...p,
      { label: optionInput, value: optionInput.toLowerCase().replace(/\s+/g, "_") },
    ]);
    setOptionInput("");
  };

  const addCustomField = () => {
    if (!fieldLabel.trim()) return;
    if (isChoiceField && options.length === 0) return;

    setCustomFields((p) => [
      ...p,
      {
        fieldId: fieldLabel.toLowerCase().replace(/\s+/g, "_"),
        label: fieldLabel,
        type,
        required: requiredField,
        archived: false,
        options: isChoiceField ? options : undefined,
      },
    ]);

    setFieldLabel("");
    setType("text");
    setRequiredField(false);
    setOptions([]);
  };

  const saveConfiguration = async () => {
    await dispatch(saveLeadConfig({ customFields }));
    alert("Configuration saved");
  };

  if (loading) return <div className="p-6 text-gray-500">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="min-h-screen">
      <div className="mx-auto bg-white rounded-3xl shadow-sm p-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-semibold">Lead Configuration</h2>
            <p className="text-gray-500 text-sm">
              Customize how your leads are captured and managed
            </p>
          </div>
          <div className="flex gap-3">
            <button
              className="px-6 py-2 rounded-full border text-gray-700"
              onClick={resetConfiguration}
            >
              Cancel
            </button>
            <button
              className="px-6 py-2 rounded-full bg-[#8b5cf6] text-white"
              onClick={saveConfiguration}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Configuration"}
            </button>
          </div>
        </div>

        {/* Mandatory Fields */}
        <section className="mb-10">
          <h3 className="text-sm font-medium mb-3">Mandatory Fields</h3>
          <div className="flex gap-4 flex-wrap">
            {requiredKeys.map((key) => (
              <label
                key={key}
                className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full text-sm cursor-pointer"
              >
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
        </section>

        {/* Lead Stages */}
        <section className="mb-10">
          <h3 className="text-sm font-medium mb-3">Lead Stages</h3>

          <div className="space-y-2 mb-3">
            {stages.map((stage) => (
              <div key={stage} className="flex justify-between border px-4 py-2 rounded-lg">
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

          <div className="flex gap-2">
            <input
              className="border rounded px-3 py-2 flex-1"
              placeholder="New stage"
              value={newStage}
              onChange={(e) => setNewStage(e.target.value)}
            />
            <button
              className="px-4 py-2 bg-gray-900 text-white rounded"
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
        </section>

        {/* Custom Fields */}
        <section className="mb-10">
          <h3 className="text-sm font-medium mb-4">Custom Fields</h3>
          <div className="space-y-3">
            {customFields.map((field, i) => (
              <div
                key={i}
                className={`flex justify-between px-6 py-4 border rounded-2xl ${
                  field.archived ? "opacity-50 italic" : ""
                }`}
              >
                <div>
                  <div className="font-medium">{field.label}</div>
                  <div className="text-xs text-gray-500">
                    {field.type} {field.required && "• Required"}
                  </div>
                </div>
                <button
                  className={field.archived ? "text-green-600" : "text-red-500"}
                  onClick={() =>
                    setCustomFields((p) =>
                      p.map((f, idx) =>
                        idx === i ? { ...f, archived: !f.archived } : f
                      )
                    )
                  }
                >
                  {field.archived ? "Unarchive" : "Archive"}
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Add Custom Field */}
        <section className="bg-gray-50 p-6 rounded-2xl border">
          <h4 className="text-sm font-medium mb-4">Add Custom Field</h4>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <input
              className="border rounded px-4 py-2"
              placeholder="Field Label"
              value={fieldLabel}
              onChange={(e) => setFieldLabel(e.target.value)}
            />
            <select
              className="border rounded px-4 py-2"
              value={type}
              onChange={(e) => setType(e.target.value as FieldType)}
            >
              <option value="text">Text</option>
              <option value="dropdown">Dropdown</option>
              <option value="radio">Radio</option>
              <option value="checkbox">Checkbox</option>
              <option value="datetime">Date & Time</option>
            </select>
          </div>

          <label className="flex gap-2 mb-4 text-sm">
            <input
              type="checkbox"
              checked={requiredField}
              onChange={() => setRequiredField((p) => !p)}
            />
            Required
          </label>

          {isChoiceField && (
            <div className="bg-white p-4 rounded border mb-4">
              <div className="text-xs mb-2">Options</div>
              {options.map((o, i) => (
                <div key={i} className="flex justify-between border rounded px-3 py-1 mb-1">
                  {o.label}
                  <button
                    className="text-red-500"
                    onClick={() =>
                      setOptions((p) => p.filter((_, idx) => idx !== i))
                    }
                  >
                    ✕
                  </button>
                </div>
              ))}
              <div className="flex gap-2 mt-2">
                <input
                  className="border rounded px-3 py-1 flex-1"
                  placeholder="Option label"
                  value={optionInput}
                  onChange={(e) => setOptionInput(e.target.value)}
                />
                <button className="bg-gray-900 text-white px-3 py-1 rounded" onClick={addOption}>
                  Add
                </button>
              </div>
            </div>
          )}

          <button
            className="px-6 py-2 rounded-full bg-gray-900 text-white"
            onClick={addCustomField}
          >
            Add Field
          </button>
        </section>
      </div>
    </div>
  );
}
