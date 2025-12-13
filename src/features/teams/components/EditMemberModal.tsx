import { useEffect, useState } from "react";
import DynamicForm, { type FieldConfig } from "../../../common/ui/DynamicForm";

export default function EditMemberModal({
  open,
  member,
  onClose,
  onSubmit,
}: {
  open: boolean;
  member: any;
  onClose: () => void;
  onSubmit: (data: any) => void;
}) {
  if (!open || !member) return null;

  // Initialize form state from member
  const [form, setForm] = useState({
    name: member.name || "",
    email: member.email || "",
    phone: member.phone || "",
    role: member.role || "manager",
  });

  // Sync if user opens modal for another member
  useEffect(() => {
    if (member) {
      setForm({
        name: member.name,
        email: member.email,
        phone: member.phone,
        role: member.role,
      });
    }
  }, [member]);

  // Update handler
  const update = (key: string, value: any) => {
    const f = fields.find((x) => x.name === key);
    if (f?.type === "number") value = Number(value);

    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Dynamic form fields
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
      placeholder: "Enter email address",
    },
    {
      name: "phone",
      label: "Phone",
      type: "text",
      placeholder: "Enter phone number",
    },
    {
      name: "role",
      label: "Role",
      type: "select",
      placeholder: "Select role",
      options: [
        { label: "Manager", value: "manager" },
        { label: "Salesperson", value: "salesperson" },
        { label: "Vendor", value: "vendor" },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-[400px] max-h-[80vh] rounded-xl shadow-lg flex flex-col">

        {/* Header */}
        <div className="p-5 border-b">
          <h2 className="text-xl font-semibold">Edit Member</h2>
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
            Save
          </button>
        </div>

      </div>
    </div>
  );
}
