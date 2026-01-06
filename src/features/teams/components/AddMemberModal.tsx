import { useEffect, useState } from "react";
import DynamicForm, { type FieldConfig } from "../../../common/ui/DynamicForm";

type UserRole = "vendor_admin" | "manager" | "sales_rep";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  currentRole: UserRole;
  currentUserId?: number;
  managers: { id: number; name: string }[];
}

interface FormState {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: "manager" | "sales_rep";
  manager_id?: number;
}

export default function AddMemberModal({
  open,
  onClose,
  onSubmit,
  currentRole,
  currentUserId,
  managers,
}: Props) {
  const [form, setForm] = useState<FormState | null>(null);

  // Initialize when modal opens
  useEffect(() => {
    if (open) {
      setForm({
        name: "",
        email: "",
        phone: "",
        password: "",
        role: currentRole === "vendor_admin" ? "manager" : "sales_rep",
        manager_id: currentRole === "manager" ? currentUserId : undefined,
      });
    }
  }, [open, currentRole, currentUserId]);

  if (!open || !form) return null;

 const update = (key: string, value: any) => {
  setForm((prev) =>
    prev && key in prev ? { ...prev, [key]: value } : prev
  );
};


  const roleOptions =
    currentRole === "vendor_admin"
      ? [
          { label: "Manager", value: "manager" },
          { label: "Sales Rep", value: "sales_rep" },
        ]
      : currentRole === "manager"
      ? [{ label: "Sales Rep", value: "sales_rep" }]
      : [];

  const fields: FieldConfig[] = [
    { name: "name", label: "Full Name", type: "text" as const },
    { name: "email", label: "Email", type: "email" as const },
    { name: "phone", label: "Phone", type: "text" as const },
    { name: "password", label: "Password", type: "text" as const },
    {
      name: "role",
      label: "Role",
      type: "select" as const,
      options: roleOptions,
    },
    ...(form.role === "sales_rep" && currentRole === "vendor_admin"
      ? [
          {
            name: "manager_id",
            label: "Manager",
            type: "select" as const,
            options: managers.map((m) => ({
              label: m.name,
              value: m.id,
            })),
          },
        ]
      : []),
  ];

  const submit = () => {
    let payload = { ...form };

    // Auto-assign manager if current user is manager
    if (currentRole === "manager") {
      payload.manager_id = currentUserId;
    }

    if (payload.role === "sales_rep" && !payload.manager_id) {
      alert("Sales rep must be assigned to a manager.");
      return;
    }

    onSubmit(payload);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-[420px] rounded-xl shadow-lg">
        <div className="p-5 border-b">
          <h2 className="text-xl font-semibold">Add Team Member</h2>
        </div>

        <DynamicForm fields={fields} form={form} onChange={update} />

        <div className="p-4 border-t flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 border rounded">
            Cancel
          </button>
          <button
            onClick={submit}
            className="px-4 py-2 bg-purple-600 text-white rounded"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
