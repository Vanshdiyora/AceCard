import { useEffect, useState } from "react";
import DynamicForm, { type FieldConfig } from "../../../common/ui/DynamicForm";

export default function EditMemberModal({
  open,
  member,
  onClose,
  onSubmit,
  currentRole,
  managers,
}: {
  open: boolean;
  member: any;
  onClose: () => void;
  onSubmit: (data: any) => void;
  currentRole: "vendor_admin" | "manager" | "sales_rep";
  managers: { id: number; name: string }[];
}) {
  const [form, setForm] = useState<any>(null);

  useEffect(() => {
    if (member) {
      setForm({
        name: member.name,
        email: member.email,
        phone: member.phone,
        role: member.role,
        manager_id: member.manager_id ?? undefined,
      });
    }
  }, [member]);

  if (!open || !form) return null;

  const update = (key: string, value: any) => {
    setForm((prev: any) => ({ ...prev, [key]: value }));
  };

  const fields: FieldConfig[] = [
    { name: "name", label: "Full Name", type: "text" as const },
    { name: "email", label: "Email", type: "email" as const },
    { name: "phone", label: "Phone", type: "text" as const },
    ...(currentRole === "vendor_admin"
      ? [
          {
            name: "role",
            label: "Role",
            type: "select" as const,
            options: [
              { label: "Manager", value: "manager" },
              { label: "Sales Rep", value: "sales_rep" },
            ],
          },
        ]
      : []),
    ...(currentRole === "vendor_admin" && member.role === "sales_rep"
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
    if (
      member.role === "sales_rep" &&
      form.manager_id !== member.manager_id &&
      currentRole !== "vendor_admin"
    ) {
      alert("Only vendor can change sales rep manager.");
      return;
    }

    onSubmit(form);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-[400px] rounded-xl shadow-lg">
        <div className="p-5 border-b">
          <h2 className="text-xl font-semibold">Edit Member</h2>
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
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
