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
  onSuccess, // 👈 NEW
  currentRole,
  managers,
  managersMeta,
  loadMoreManagers,
}: {
  open: boolean;
  member: any;
  onClose: () => void;
  onSubmit: (data: any) => Promise<any>; // 👈 make async
  onSuccess?: (updated: any) => void; // 👈 callback
  currentRole: "vendor_admin" | "manager" | "sales_rep";
  managers: { id: number; name: string }[];
  managersMeta?: any;              // ✅ NEW
  loadMoreManagers?: () => void;   // ✅ NEW

}) {

  const [form, setForm] = useState<any>(null);
  const [errors, setErrors] = useState<
    Record<string, string | null>
  >({});
 const [submitAttempted, setSubmitAttempted] = useState(false);

  /* ---------- INIT FORM ---------- */
  useEffect(() => {
    if (!open || !member) return;

    setForm({
      name: member.name ?? "",
      email: member.email ?? "",
      phone: member.phone ?? "",
      role: member.role,
      manager_id: member.manager_id ?? undefined,
      avatar: member.avatar ?? "",
      custom_job_role: member.custom_job_role ?? "", // 👈 ADD
    });
setSubmitAttempted(false); 

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
      name: "avatar",
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
    {
      name: "custom_job_role",
      label: "Custom Job Role",
      type: "text",
      placeholder: "e.g. Senior Sales Manager",
      required: true,
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
          hasMore: managersMeta
            ? managersMeta.page < managersMeta.total_pages
            : false,
          onLoadMore: loadMoreManagers,
        }

      ]
      : []),
  ];


  /* ---------- SUBMIT ---------- */
  const submit = async () => {
    setSubmitAttempted(true); // ✅ ADD

    // ✅ Collect all errors at once
    const newErrors: Record<string, string | null> = {};
    let hasErrors = false;

    fields.forEach((field) => {
      const error = validateField(field, form[field.name], form);
      newErrors[field.name] = error;
      if (error) hasErrors = true;
    });

    setErrors(newErrors); // ✅ Single update

    if (hasErrors) return;

    if (
      member.role === "sales_rep" &&
      form.manager_id !== member.manager_id &&
      currentRole !== "vendor_admin"
    ) {
      alert("Only vendor admin can change sales rep manager.");
      return;
    }

    try {
      const updated = await onSubmit(form);
      onSuccess?.(updated);
      onClose();
    } catch (e) {
      console.error("Update failed", e);
    }
  };

  /* ---------- UI ---------- */
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-[400px] max-h-[90vh] rounded-xl shadow-lg flex flex-col">

        {/* Header */}
        <div className="p-5 border-b">
          <h2 className="text-xl font-semibold">
            Edit Member
          </h2>
        </div>

        {/* Scrollable Form Area */}
        <div className="overflow-y-auto flex-1">
          <DynamicForm
            fields={fields}
            form={form}
            onChange={update}
            errors={errors}
            setErrors={setErrors}
            submitAttempted={submitAttempted}
          />
        </div>

        {/* Footer */}
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
