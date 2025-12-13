import { useState } from "react";
import { useAppDispatch } from "../../../app/hooks";
import { createCampaign, fetchCampaigns } from "../slice";
import type { CampaignStatus } from "../types";
import DynamicForm, { type FieldConfig } from "../../../common/ui/DynamicForm";

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

export default function CreateCampaignModal({ open, onClose }: CreateCampaignModalProps) {
  const dispatch = useAppDispatch();

  // 🔹 Removed targets.tt completely
  const [form, setForm] = useState({
    name: "",
    description: "",
    status: "planned" as CampaignStatus,
    budget: 0,
    leads_generated: 0,
    conversion_rate: 0,
    pipeline_value: 0,
  });

  if (!open) return null;

  // Simple update (no nested fields)
  const update = (key: string, value: any) => {
    const field = fields.find((f) => f.name === key);

    // Auto convert number fields
    if (field?.type === "number") value = Number(value);

    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = async () => {
    const payload = {
      ...form,
      budget: Number(form.budget),
      leads_generated: Number(form.leads_generated),
      conversion_rate: Number(form.conversion_rate),
      pipeline_value: Number(form.pipeline_value),
    };

    await dispatch(createCampaign(payload));
    await dispatch(fetchCampaigns());
    onClose();
  };

  // 🔹 Fields config WITHOUT target.tt
  const fields: FieldConfig[] = [
    {
      name: "name",
      label: "Campaign Name",
      type: "text",
      placeholder: "Enter campaign name",
    },
    {
      name: "description",
      label: "Description",
      type: "textarea",
      placeholder: "Write description",
    },
    {
      name: "status",
      label: "Status",
      type: "select",
      placeholder: "Select status",
      options: STATUS_OPTIONS.map((s) => ({ label: s, value: s })),
    },
    {
      name: "budget",
      label: "Budget",
      type: "number",
      placeholder: "Enter budget",
    },
    {
      name: "leads_generated",
      label: "Leads Generated",
      type: "number",
      placeholder: "Enter leads generated",
    },
    {
      name: "conversion_rate",
      label: "Conversion Rate",
      type: "number",
      placeholder: "Enter conversion rate",
    },
    {
      name: "pipeline_value",
      label: "Pipeline Value",
      type: "number",
      placeholder: "Enter pipeline value",
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-[500px] max-h-[85vh] rounded-xl shadow-lg flex flex-col">

        {/* Header */}
        <div className="p-5 border-b">
          <h2 className="text-xl font-semibold">Create Campaign</h2>
        </div>

        {/* Form */}
        <DynamicForm fields={fields} form={form} onChange={update} />

        {/* Footer */}
        <div className="p-4 border-t flex justify-end gap-3">
          <button className="px-4 py-2 bg-gray-200 rounded" onClick={onClose}>
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
