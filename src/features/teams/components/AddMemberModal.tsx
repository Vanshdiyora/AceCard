import { useState } from "react";
import DynamicForm, { type FieldConfig } from "../../../common/ui/DynamicForm";

export default function AddMemberModal({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "manager",
  });

  if (!open) return null;

  const update = (key: string, value: any) => {
    const field = fields.find((f) => f.name === key);

    // auto convert number fields (phone is string, so no conversion)
    if (field?.type === "number") value = Number(value);

    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const fields: FieldConfig[] = [
    {
      name: "name",
      label: "Full Name",
      type: "text",
      placeholder: "Enter full name",
    },
    {
      name: "email",
      label: "Email",
      type: "email",
      placeholder: "Enter email",
    },
    {
      name: "phone",
      label: "Phone",
      type: "text", // ✔ keep as text (phone numbers shouldn't be numeric)
      placeholder: "Enter phone number",
    },
    {
      name: "password",
      label: "Password",
      type: "text", // if you want masked password, I can add type="password" support
      placeholder: "Enter password",
    },
    {
      name: "role",
      label: "Role",
      type: "select",
      placeholder: "Select role",
      options: [
        { label: "Manager", value: "manager" },
        { label: "Salesperson", value: "sales_rep" },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-[400px] max-h-[80vh] rounded-xl shadow-lg flex flex-col">

        {/* Header */}
        <div className="p-5 border-b">
          <h2 className="text-xl font-semibold">Add Team Member</h2>
        </div>

        {/* Dynamic Form */}
        <DynamicForm fields={fields} form={form} onChange={update} />

        {/* Footer */}
        <div className="p-4 border-t flex justify-end gap-2">
          <button className="px-4 py-2 border rounded" onClick={onClose}>
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-purple-600 text-white rounded"
            onClick={() => onSubmit(form)}
          >
            Add
          </button>
        </div>

      </div>
    </div>
  );
}
