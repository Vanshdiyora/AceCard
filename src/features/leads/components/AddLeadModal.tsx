import { useState } from "react";
import DynamicForm, { type FieldConfig } from "../../../common/ui/DynamicForm";

export default function AddLeadModal({ open, onClose, onSubmit }: any) {
  const [form, setForm] = useState({
    lead_name: "",
    phone: "",
    email: "",
    company: "",
    stage: "new",
    deal_amount: 0,
    source: "manual",
  });

  if (!open) return null;

  // FIX: Auto-convert number fields
  const update = (key: string, value: any) => {
    const field = fields.find((f) => f.name === key);

    if (field?.name === "deal_amount") {
      value = Number(value);
    }

    setForm({ ...form, [key]: value });
  };

  const fields: FieldConfig[] = [
    { name: "lead_name", label: "Lead Name", type: "text", placeholder: "Enter lead name" },
    { name: "phone", label: "Phone", type: "number", placeholder: "Enter phone number" },
    { name: "email", label: "Email", type: "email", placeholder: "Enter email address" },
    { name: "company", label: "Company", type: "text", placeholder: "Company name" },
    {
      name: "stage",
      label: "Stage",
      type: "select",
      placeholder: "Select stage",
      options: [
        { label: "New", value: "new" },
        { label: "Contacted", value: "contacted" },
        { label: "Qualified", value: "qualified" },
        { label: "Won", value: "won" },
      ],
    },
    {
      name: "deal_amount",
      label: "Deal Amount",
      type: "number",
      placeholder: "Enter amount",
    },
    {
      name: "source",
      label: "Source",
      type: "select",
      placeholder: "Select source",
      options: [
        { label: "Manual", value: "manual" },
        { label: "Website", value: "website" },
        { label: "Referral", value: "referral" },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4">
      <div className="bg-white w-[400px] max-h-[80vh] rounded-lg shadow-lg flex flex-col">

        {/* Header */}
        <div className="p-5 border-b">
          <h2 className="text-xl font-semibold">Add Lead</h2>
        </div>

        {/* Dynamic Form */}
        <DynamicForm fields={fields} form={form} onChange={update} />

        {/* Footer */}
        <div className="p-4 border-t flex justify-end gap-2">
          <button className="px-4 py-2" onClick={onClose}>Cancel</button>
          <button
            className="px-4 py-2 bg-purple-600 text-white rounded"
            onClick={() => onSubmit(form)}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
