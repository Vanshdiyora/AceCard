import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { fetchLeadConfig, saveLeadConfig } from "../slice";
import type { CustomField, FieldType, Option } from "../types";
import BrandLoader from "../../../common/ui/BrandLoader";
import ResultModal from "../../../common/ui/ResultModal";

export default function LeadConfiguration() {
  const dispatch = useAppDispatch();
  const { data, loading, saving, error } = useAppSelector(
    (s) => s.settings.leadConfig
  );

  const [standardFields, setStandardFields] = useState<Record<string, boolean>>(
    {}
  );
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [result, setResult] = useState<{
    open: boolean;
    success: boolean;
    message: string;
  }>({
    open: false,
    success: true,
    message: "",
  });


  const [newStage, setNewStage] = useState("");
  const [stageError, setStageError] = useState("");

  const [fieldLabel, setFieldLabel] = useState("");
  const [type, setType] = useState<FieldType>("text");
  const [requiredField, setRequiredField] = useState(false);

  const [optionInput, setOptionInput] = useState("");
  const [options, setOptions] = useState<Option[]>([]);

  const isChoiceField =
    type === "dropdown" || type === "radio" || type === "checkbox";

  const stageField = customFields.find((f) => f.fieldId === "stage");
  const stages = stageField?.options ?? [];

  /* ---------------- Load Config ---------------- */

  useEffect(() => {
    dispatch(fetchLeadConfig());
  }, [dispatch]);

  useEffect(() => {
  if (!data) return;

  const existingCustom = data.customFields || [];
  const hasStage = existingCustom.some((f) => f.fieldId === "stage");

  const withStage = hasStage
    ? existingCustom
    : [
        {
          fieldId: "stage",
          label: "Stage",
          type: "dropdown" as FieldType,
          required: true,
          archived: false,
          options: [],
        },
        ...existingCustom,
      ];

  setStandardFields(data.standardFields || {});
  setCustomFields(withStage);
}, [data]);

  const STAGE_COLORS = [
    { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-300" },
    { bg: "bg-green-100", text: "text-green-700", border: "border-green-300" },
    { bg: "bg-yellow-100", text: "text-yellow-700", border: "border-yellow-300" },
    { bg: "bg-gray-100", text: "text-gray-700", border: "border-gray-300" },
    { bg: "bg-red-100", text: "text-red-700", border: "border-red-300" },
    { bg: "bg-orange-100", text: "text-orange-700", border: "border-orange-300" },
  ];

  /* ---------------- Handlers ---------------- */

  const resetConfiguration = () => {
    if (!data) return;
    setStandardFields(data.standardFields || {});
    setCustomFields(data.customFields || []);
    setFieldLabel("");
    setType("text");
    setRequiredField(false);
    setOptions([]);
    setOptionInput("");
    setNewStage("");
  };

  const addOption = () => {
    if (!optionInput.trim()) return;
    setOptions((p) => [
      ...p,
      {
        label: optionInput,
        value: optionInput.toLowerCase().replace(/\s+/g, "_"),
      },
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

  const addStage = () => {
    if (!newStage.trim()) {
      setStageError("Stage name is required.");
      return;
    }

    if (!stageField) return;

    setCustomFields((prev) =>
      prev.map((f) =>
        f.fieldId === "stage"
          ? {
            ...f,
            options: [
              ...(f.options || []),
              {
                label: newStage,
                value: newStage.toLowerCase().replace(/\s+/g, "_"),
                color: STAGE_COLORS[0],
              },
            ],
          }
          : f
      )
    );

    setNewStage("");
    setStageError(""); // clear error after success
  };

  const removeStage = (value: string) => {
    setCustomFields((prev) =>
      prev.map((f) =>
        f.fieldId === "stage"
          ? { ...f, options: f.options?.filter((o) => o.value !== value) }
          : f
      )
    );
  };

  const saveConfiguration = async () => {
    try {
      await dispatch(
        saveLeadConfig({
          standardFields,
          customFields,
        })
      ).unwrap();

      setResult({
        open: true,
        success: true,
        message: "Lead configuration saved successfully.",
      });
    } catch {
      setResult({
        open: true,
        success: false,
        message: "Failed to save lead configuration.",
      });
    }
  };

  if (saving)
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <BrandLoader />
      </div>
    );

  /* ---------------- Render ---------------- */
  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <BrandLoader />
      </div>
    );

  if (error) return <div className="p-6 text-red-600">{error}</div>;
  const formatStandardFieldLabel = (key: string) =>
    key
      .replace(/([A-Z])/g, " $1")   // split camelCase
      .replace(/^./, (c) => c.toUpperCase()); // capitalize first letter

  return (
    <div className="">
      <ResultModal
        open={result.open}
        success={result.success}
        message={result.message}
        onClose={() => setResult((r) => ({ ...r, open: false }))}
      />

      {/* MAIN CARD */}
      <div className="mx-auto bg-white rounded-3xl shadow-sm flex flex-col">

        {/* ===== FIXED HEADER ===== */}
        <div className="p-10 border-b bg-white rounded-t-3xl">
          <div className="flex items-center justify-between">
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
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>

        {/* ===== SCROLLABLE CONTENT ===== */}
        <div className="flex-1 overflow-y-auto px-10 py-8 space-y-10">

          {/* Standard Fields */}
          <section>
            <h3 className="text-sm font-semibold mb-4 text-gray-700">
              Standard Fields
            </h3>

            {Object.keys(standardFields).length === 0 ? (
              <div className="text-gray-500 italic text-sm">
                No standard fields configured.
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(standardFields).map(([key, val]) => (
                  <label
                    key={key}
                    className={`flex items-center justify-between px-4 py-3 rounded-2xl border cursor-pointer transition
                    ${val
                        ? "bg-purple-50 border-purple-300 shadow-sm"
                        : "bg-white hover:bg-gray-50 border-gray-200"
                      }`}
                  >
                    <span className="text-sm font-medium text-gray-700">
                      {formatStandardFieldLabel(key)}
                    </span>

                    <span className="relative">
                      <input
                        type="checkbox"
                        checked={val}
                        onChange={() =>
                          setStandardFields((p) => ({ ...p, [key]: !p[key] }))
                        }
                        className="sr-only"
                      />
                      <span
                        className={`w-5 h-5 flex items-center justify-center rounded-full border
                        ${val
                            ? "bg-purple-600 border-purple-600"
                            : "bg-white border-gray-300"
                          }`}
                      >
                        {val && (
                          <span className="w-2.5 h-2.5 bg-white rounded-full" />
                        )}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            )}
          </section>

          {/* Lead Stages */}
          <section>
            <h3 className="text-sm font-medium mb-3">Lead Stages</h3>

            <div className="space-y-3 mb-3">
              {stages.map((stage) => (
                <div
                  key={stage.value}
                  className={`px-4 py-3 rounded-xl border`}
                >
                  <div className="flex items-center justify-between gap-6">

                    {/* LEFT: Label */}
                    <div className="w-40 shrink-0">
                      <span
                        className={`font-medium text-gray-700`}
                      >
                        {stage.label}
                      </span>
                    </div>

                    {/* CENTER: Color Selector */}
                    <div className="flex gap-2 flex-1 justify-center">
                      {STAGE_COLORS.map((color, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() =>
                            setCustomFields((prev) =>
                              prev.map((f) =>
                                f.fieldId === "stage"
                                  ? {
                                    ...f,
                                    options: f.options?.map((o) =>
                                      o.value === stage.value
                                        ? { ...o, color }
                                        : o
                                    ),
                                  }
                                  : f
                              )
                            )
                          }
                          className={`w-5 h-5 rounded-full border-2 transition
                ${color.bg}
                ${stage.color?.bg === color.bg
                              ? "ring-2 ring-offset-1 ring-gray-500"
                              : "border-transparent"
                            }
              `}
                        />
                      ))}
                    </div>

                    {/* RIGHT: Remove Button */}
                    <div className="w-20 text-right shrink-0">
                      <button
                        className="text-red-500 text-sm"
                        onClick={() => removeStage(stage.value)}
                      >
                        Remove
                      </button>
                    </div>

                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex gap-2">
                <input
                  className={`border rounded px-3 py-2 flex-1 ${stageError ? "border-red-500" : ""
                    }`}
                  placeholder="New stage"
                  value={newStage}
                  onChange={(e) => {
                    setNewStage(e.target.value);
                    if (stageError) setStageError("");
                  }}
                />
                <button
                  className="px-4 py-2 bg-gray-900 text-white rounded"
                  onClick={addStage}
                >
                  Add
                </button>
              </div>

              {stageError && (
                <span className="text-red-500 text-xs mt-1">
                  {stageError}
                </span>
              )}
            </div>
          </section>

          {/* Custom Fields */}
          <section>
            <h3 className="text-sm font-medium mb-4">Custom Fields</h3>

            <div className="space-y-3">
              {customFields
                .filter((f) => f.fieldId !== "stage")
                .map((field) => (
                  <div
                    key={field.fieldId}
                    className={`flex justify-between items-center px-6 py-4 rounded-2xl border
                    ${field.archived
                        ? "bg-gray-100 opacity-60"
                        : "bg-white hover:shadow-sm"
                      }`}
                  >
                    <div>
                      <div className="font-medium">{field.label}</div>
                      <div className="text-xs text-gray-500">
                        {field.type} {field.required && "• Required"}
                      </div>
                    </div>

                    <button
                      className={
                        field.archived
                          ? "text-green-600"
                          : "text-red-500"
                      }
                      onClick={() =>
                        setCustomFields((prev) =>
                          prev.map((f) =>
                            f.fieldId === field.fieldId
                              ? { ...f, archived: !f.archived }
                              : f
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
          <section className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-2xl border shadow-sm">
            {/* 🔹 unchanged add custom field section */}
            {/* (exact same code you already have) */}
            <div className="mb-5">
              <h4 className="text-sm font-semibold text-gray-800">
                Add Custom Field
              </h4>
              <p className="text-xs text-gray-500 mt-1">
                Create additional fields to capture custom lead data
              </p>
            </div>

            {/* Field Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">
                  Field Label
                </label>
                <input
                  className="w-full rounded-xl border px-4 py-2.5 text-sm focus:ring-2 focus:ring-purple-300 focus:border-purple-400 outline-none"
                  placeholder="e.g. Budget Range"
                  value={fieldLabel}
                  onChange={(e) => setFieldLabel(e.target.value)}
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">
                  Field Type
                </label>
                <select
                  className="w-full rounded-xl border px-4 py-2.5 text-sm bg-white focus:ring-2 focus:ring-purple-300 focus:border-purple-400 outline-none"
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
            </div>

            {/* Required Toggle */}
            <label className="flex items-center gap-3 mb-5 cursor-pointer">
              <input
                type="checkbox"
                checked={requiredField}
                onChange={() => setRequiredField((p) => !p)}
                className="sr-only"
              />
              <span
                className={`w-10 h-5 rounded-full transition relative
        ${requiredField ? "bg-purple-600" : "bg-gray-300"}
      `}
              >
                <span
                  className={`absolute top-0.5 h-4 w-4 bg-white rounded-full transition
          ${requiredField ? "right-0.5" : "left-0.5"}
        `}
                />
              </span>
              <span className="text-sm text-gray-700">
                Required field
              </span>
            </label>

            {/* Options */}
            {isChoiceField && (
              <div className="bg-white p-4 rounded-xl border mb-5">
                <div className="text-xs font-medium text-gray-600 mb-2">
                  Field Options
                </div>

                <div className="flex flex-wrap gap-2 mb-3">
                  {options.map((o, i) => (
                    <span
                      key={i}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-50 text-purple-700 text-xs"
                    >
                      {o.label}
                      <button
                        className="text-purple-400 hover:text-red-500"
                        onClick={() =>
                          setOptions((p) => p.filter((_, idx) => idx !== i))
                        }
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    className="flex-1 rounded-xl border px-3 py-2 text-sm focus:ring-2 focus:ring-purple-300 focus:border-purple-400 outline-none"
                    placeholder="Option label"
                    value={optionInput}
                    onChange={(e) => setOptionInput(e.target.value)}
                  />
                  <button
                    className="px-4 py-2 rounded-xl bg-purple-600 text-white text-sm hover:bg-purple-700"
                    onClick={addOption}
                  >
                    Add
                  </button>
                </div>
              </div>
            )}

            {/* Action */}
            <div className="flex justify-end">
              <button
                className="px-6 py-2.5 rounded-full bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition"
                onClick={addCustomField}
              >
                + Add Field
              </button>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}

