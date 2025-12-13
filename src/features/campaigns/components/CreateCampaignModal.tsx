import { useState } from "react";
import { useAppDispatch } from "../../../app/hooks";
import { createCampaign, fetchCampaigns } from "../slice";
import type { CampaignStatus } from "../types";

const STATUS_OPTIONS = [
  "planned",
  "draft",
  "active",
  "paused",
  "archived",
  "completed",
  "expired",
];

interface CreateCampaignModalProps {
  open: boolean;
  onClose: () => void;
}

export default function CreateCampaignModal({ open, onClose } : CreateCampaignModalProps) {
  const dispatch = useAppDispatch();

 const [form, setForm] = useState<{
  name: string;
  description: string;
  status: CampaignStatus;
  budget: number;
  targets: { tt: number | string };
  leads_generated: number;
  conversion_rate: number;
  pipeline_value: number;
}>({
  name: "",
  description: "",
  status: "planned",
  budget: 0,
  targets: { tt: "" },
  leads_generated: 0,
  conversion_rate: 0,
  pipeline_value: 0,
});

  const handleChange = (field: string, value: any) => {
    setForm({ ...form, [field]: value });
  };

  const handleSubmit = async () => {
    const payload = {
      ...form,
      budget: Number(form.budget),
      leads_generated: Number(form.leads_generated),
      conversion_rate: Number(form.conversion_rate),
      pipeline_value: Number(form.pipeline_value),
      targets: { tt: Number(form.targets.tt) },
    };

    await dispatch(createCampaign(payload));
    await dispatch(fetchCampaigns()); // refresh list
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-[500px] p-6 rounded-xl shadow-lg space-y-4">

        <h2 className="text-xl font-semibold">Create Campaign</h2>

        {/* Name */}
        <input
          className="border p-2 w-full rounded"
          placeholder="Campaign name"
          value={form.name}
          onChange={(e) => handleChange("name", e.target.value)}
        />

        {/* Description */}
        <textarea
          className="border p-2 w-full rounded"
          placeholder="Description"
          value={form.description}
          onChange={(e) => handleChange("description", e.target.value)}
        />

        {/* Status */}
        <select
          className="border p-2 w-full rounded"
          value={form.status}
          onChange={(e) => handleChange("status", e.target.value)}
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        {/* Budget */}
        <input
          className="border p-2 w-full rounded"
          placeholder="Budget"
          type="number"
          value={form.budget}
          onChange={(e) => handleChange("budget", e.target.value)}
        />

        {/* Targets (tt) */}
        <input
          className="border p-2 w-full rounded"
          placeholder="Target (tt)"
          type="number"
          value={form.targets.tt}
          onChange={(e) =>
            setForm({ ...form, targets: { tt: e.target.value } })
          }
        />

        {/* Leads generated */}
        <input
          className="border p-2 w-full rounded"
          placeholder="Leads generated"
          type="number"
          value={form.leads_generated}
          onChange={(e) => handleChange("leads_generated", e.target.value)}
        />

        {/* Conversion rate */}
        <input
          className="border p-2 w-full rounded"
          placeholder="Conversion rate"
          type="number"
          value={form.conversion_rate}
          onChange={(e) => handleChange("conversion_rate", e.target.value)}
        />

        {/* Pipeline value */}
        <input
          className="border p-2 w-full rounded"
          placeholder="Pipeline value"
          type="number"
          value={form.pipeline_value}
          onChange={(e) => handleChange("pipeline_value", e.target.value)}
        />

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            className="px-4 py-2 bg-gray-200 rounded"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            className="px-4 py-2 bg-purple-600 text-white rounded"
            onClick={handleSubmit}
          >
            Create
          </button>
        </div>

      </div>
    </div>
  );
}
