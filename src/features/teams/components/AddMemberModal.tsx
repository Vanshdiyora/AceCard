import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { fetchTeam } from "../../teams/slice";
import DynamicForm, { type FieldConfig } from "../../../common/ui/DynamicForm";
import { validateField } from "../../../common/utils/formValidator";
import { uploadImage } from "../../publicProfile/services/publicProfile.api";

type UserRole = "vendor_admin" | "manager" | "sales_rep";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  currentRole: UserRole;
  currentUserId?: number;
}

interface FormState {
  name: string;
  email: string;
  phone: string;
  role: "manager" | "sales_rep";
  manager_id?: number;
  avatar?: string;
  custom_job_role?: string;
}

export default function AddMemberModal({
  open,
  onClose,
  onSubmit,
  currentRole,
  currentUserId,
}: Props) {
  const dispatch = useAppDispatch();
  const { managers } = useAppSelector((s) => s.team);

  const [form, setForm] = useState<FormState | null>(null);
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);

  /* ---------- PAGINATION STATE ---------- */
  const [managerPage, setManagerPage] = useState(1);
  const [hasNextManagers, setHasNextManagers] = useState(true);
  const [loadingMoreManagers, setLoadingMoreManagers] = useState(false);

  /* ---------- INIT ---------- */
  useEffect(() => {
    if (!open) return;

    setForm({
      name: "",
      email: "",
      phone: "",
      role: currentRole === "vendor_admin" ? "manager" : "sales_rep",
      manager_id: currentRole === "manager" ? currentUserId : undefined,
      avatar: "",
      custom_job_role: "",
    });
    setSubmitAttempted(false);
    setErrors({});
    setManagerPage(1);
    setHasNextManagers(true);

    // Initial managers fetch
    dispatch(fetchTeam({ page: 1, page_size: 10, role: "manager", append: true }))
      .unwrap()
      .then((res: any) => setHasNextManagers(res.meta.has_next));
  }, [open, currentRole, currentUserId]);

  if (!open || !form) return null;

  /* ---------- UPDATE ---------- */
  const update = (key: string, value: any) => {
    let parsedValue = value;
    if (key === "manager_id") {
      parsedValue = value === "" || value == null ? undefined : Number(value);
    }
    setForm((prev) => ({ ...prev!, [key]: parsedValue }));
  };

  /* ---------- LOAD MORE MANAGERS ---------- */
  const loadMoreManagers = async () => {
    if (loadingMoreManagers || !hasNextManagers) return;

    setLoadingMoreManagers(true);
    const next = managerPage + 1;

    const res: any = await dispatch(
      fetchTeam({ page: next, page_size: 10, role: "manager", append: true })
    ).unwrap();

    setManagerPage(next);
    setHasNextManagers(res.meta.has_next);
    setLoadingMoreManagers(false);
  };

  /* ---------- ROLE OPTIONS ---------- */
  const roleOptions =
    currentRole === "vendor_admin"
      ? [
        { label: "Manager", value: "manager" },
        { label: "Sales Person", value: "sales_rep" },
      ]
      : currentRole === "manager"
        ? [{ label: "Sales Person", value: "sales_rep" }]
        : [];

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
      type: "text",
      placeholder: "Enter full name",
      required: true,
    },
    {
      name: "email",
      label: "Email",
      type: "email",
      placeholder: "Enter email address",
      required: true,
    },
    {
      name: "phone",
      label: "Phone",
      type: "text",
      placeholder: "Enter phone number",
      required: true,
    },
    {
      name: "role",
      label: "Role",
      type: "select",
      required: true,
      options: roleOptions,
    },
    ...(form.role === "sales_rep" && currentRole === "vendor_admin"
      ? [
        {
          name: "manager_id",
          label: "Manager",
          type: "search-select" as const,
          required: true,
          placeholder: "Search and select manager",
          options: managers.map((m) => ({
            label: m.name,
            value: m.id,
          })),
          onScrollEnd: loadMoreManagers,
          showLoader: loadingMoreManagers,
        },
      ]
      : []),
    {
      name: "custom_job_role",
      label: "Custom Job Role",
      type: "text",
      placeholder: "Enter custom job role",
      required: true,
    },
  ];

  /* ---------- SUBMIT ---------- */
  const submit = () => {
    setSubmitAttempted(true);

    const newErrors: Record<string, string | null> = {};
    let hasErrors = false;

    fields.forEach((field) => {
      const error = validateField(field, form[field.name as keyof FormState], form);
      newErrors[field.name] = error;
      if (error) hasErrors = true;
    });

    setErrors(newErrors);
    if (hasErrors) return;

    let payload = { ...form };
    if (currentRole === "manager") {
      payload.manager_id = currentUserId;
    }
    onSubmit(payload);
  };

  /* ---------- UI ---------- */
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-[420px] max-h-[90vh] overflow-y-auto rounded-xl shadow-lg">
        <div className="p-5 border-b">
          <h2 className="text-xl font-semibold">Add Team Member</h2>
        </div>

        <DynamicForm
          fields={fields}
          form={form}
          onChange={update}
          errors={errors}
          setErrors={setErrors}
          submitAttempted={submitAttempted}
        />

        <div className="p-4 border-t flex justify-end gap-2 sticky bottom-0 bg-white">
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