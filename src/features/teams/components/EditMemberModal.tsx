import { useEffect, useState } from "react";
import DynamicForm, {
  type FieldConfig,
} from "../../../common/ui/DynamicForm";
import { validateField } from "../../../common/utils/formValidator";
import { uploadImage } from "../../publicProfile/services/publicProfile.api";

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
  const [errors, setErrors] = useState<
    Record<string, string | null>
  >({});

  /* ---------- INIT FORM ---------- */
  useEffect(() => {
    if (!open || !member) return;

    setForm({
      name: member.name ?? "",
      email: member.email ?? "",
      phone: member.phone ?? "",
      role: member.role,
      manager_id: member.manager_id ?? undefined,
      avatar_url: member.avatar_url ?? "",
    });

    setErrors({});
  }, [member, open]);

  if (!open || !form) return null;

  /* ---------- UPDATE HANDLER ---------- */
  const update = (key: string, value: any) => {
    let parsedValue = value;

    if (key === "manager_id") {
      parsedValue =
        value === "" || value == null ? undefined : Number(value);
    }

    setForm((prev: any) => ({ ...prev, [key]: parsedValue }));
  };

  /* ---------- FIELD CONFIG ---------- */
  const fields: FieldConfig[] = [
    {
      name: "avatar_url",
      label: "Avatar",
      type: "image",
      upload: async (file: File) => {
        const res = await uploadImage(file);
        return res.data.url;
      },
    },

    {
      name: "name",
      label: "Full Name",
      type: "text" as const,
      required: true,
      minLength: 2,
    },
    {
      name: "email",
      label: "Email",
      type: "email" as const,
      required: true,
    },
    {
      name: "phone",
      label: "Phone",
      type: "text" as const,
      required: true,
      pattern: /^[0-9+\-()\s]{7,15}$/,
    },
    ...(currentRole === "vendor_admin"
      ? [
        {
          name: "role",
          label: "Role",
          type: "select" as const,
          required: true,
          options: [
            { label: "Manager", value: "manager" },
            { label: "Sales Rep", value: "sales_rep" },
          ],
        },
      ]
      : []),
    ...(currentRole === "vendor_admin" && form.role === "sales_rep"
      ? [
        {
          name: "manager_id",
          label: "Manager",
          type: "select" as const,
          required: true,
          options: managers.map((m) => ({
            label: m.name,
            value: m.id,
          })),
        },
      ]
      : []),
  ];


  /* ---------- SUBMIT ---------- */
  const submit = () => {
    // 🔒 VALIDATE FIELDS
    const hasErrors = fields.some((field) => {
      const error = validateField(
        field,
        form[field.name],
        form
      );

      setErrors((prev) => ({
        ...prev,
        [field.name]: error,
      }));

      return error;
    });

    if (hasErrors) return;

    // 🔐 PERMISSION CHECK (existing logic)
    if (
      member.role === "sales_rep" &&
      form.manager_id !== member.manager_id &&
      currentRole !== "vendor_admin"
    ) {
      alert("Only vendor admin can change sales rep manager.");
      return;
    }

    onSubmit(form);
  };

  /* ---------- UI ---------- */
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-[400px] rounded-xl shadow-lg">
        <div className="p-5 border-b">
          <h2 className="text-xl font-semibold">
            Edit Member
          </h2>
        </div>

        <DynamicForm
          fields={fields}
          form={form}
          onChange={update}
          errors={errors}
          setErrors={setErrors}
        />

        <div className="p-4 border-t flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded"
          >
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
