import { useState } from "react";

type RequiredFields = {
  name: boolean;
  phone: boolean;
  email: boolean;
  product: boolean;
};

const requiredKeys = ["name", "phone", "email", "product"] as const;

export default function LeadConfiguration() {
  const [required, setRequired] = useState<RequiredFields>({
    name: true,
    phone: true,
    email: false,
    product: false,
  });

  const [stages, setStages] = useState<string[]>([
    "New",
    "Contacted",
    "Qualified",
    "Won",
  ]);

  const [newStage, setNewStage] = useState("");

  return (
    <div className="bg-white shadow p-8 rounded-xl border">
      <h2 className="text-xl font-semibold mb-6">Lead Configuration</h2>

      {/* Mandatory Fields */}
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

      {/* Lead Stages */}
      <h3 className="font-semibold mb-3">Lead Stages</h3>

      <div className="space-y-2 mb-4">
        {stages.map((stage, i) => (
          <div
            key={i}
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

      {/* Add Stage */}
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

      <button className="px-6 py-2 bg-purple-600 text-white rounded-lg">
        Save Configuration
      </button>
    </div>
  );
}
