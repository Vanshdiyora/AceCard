import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { fetchTeam } from "../slice";
import DynamicForm, { type FieldConfig } from "../../../common/ui/DynamicForm";
import { validateField } from "../../../common/utils/formValidator";
import { uploadImage } from "../../publicProfile/services/publicProfile.api";

export default function EditMemberModal({
  open,
  member,
  onClose,
  onSubmit,
  onSuccess,
  currentRole,
}: {
  open: boolean;
  member: any;
  onClose: () => void;
  onSubmit: (data: any) => Promise<any>;
  onSuccess?: (updated: any) => void;
  currentRole: "vendor_admin" | "manager" | "sales_rep";
}) {
  const dispatch = useAppDispatch();
  const { managers } = useAppSelector((s) => s.team);

  const [form, setForm] = useState<any>(null);
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);

  /* ---------- PAGINATION STATE ---------- */
  const [managerPage, setManagerPage] = useState(1);
  const [hasNextManagers, setHasNextManagers] = useState(true);
  const [loadingMoreManagers, setLoadingMoreManagers] = useState(false);

  /* ---------- INIT ---------- */
  useEffect(() => {
    if (!open || !member) return;

    setForm({
      name: member.name ?? "",
      email: member.email ?? "",
      phone: member.phone ?? "",
      role: member.role,
      manager_id: member.manager_id ?? undefined,
      avatar: member.avatar ?? "",
      custom_job_role: member.custom_job_role ?? "",
    });
    setSubmitAttempted(false);
    setErrors({});
    setManagerPage(1);
    setHasNextManagers(true);

    // Initial managers fetch
    dispatch(fetchTeam({ page: 1, page_size: 10, role: "manager", append: true }))
      .unwrap()
      .then((res: any) => setHasNextManagers(res.meta.has_next));
  }, [member, open]);

  if (!open || !form) return null;

  /* ---------- UPDATE ---------- */
  const update = (key: string, value: any) => {
    let parsedValue = value;
    if (key === "manager_id") {
      parsedValue = value === "" || value == null ? undefined : Number(value);
    }
    setForm((prev: any) => ({ ...prev, [key]: parsedValue }));
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
      placeholder: "Enter full name",
      type: "text",
      required: true,
      minLength: 2,
    },
    {
      name: "email",
      label: "Email",
      placeholder: "Enter email address",
      type: "email",
      required: true,
    },
    {
      name: "phone",
      label: "Phone",
      type: "text",
      placeholder: "Enter phone number",
      required: true,
      pattern: /^[0-9+\-()\s]{7,15}$/,
    },
    {
      name: "custom_job_role",
      label: "Custom Job Role",
      type: "text",
      placeholder: "Enter custom job role",
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
            type: "search-select" as const,
            required: true,
            placeholder: "Search and select manager",
            options: [
              // Always keep the currently assigned manager at top
              ...(member.manager_id
                ? [
                    {
                      label:
                        managers.find((m) => m.id === member.manager_id)
                          ?.name ?? `Manager #${member.manager_id}`,
                      value: member.manager_id,
                    },
                  ]
                : []),
              ...managers
                .filter((m) => m.id !== member.manager_id)
                .map((m) => ({ label: m.name, value: m.id })),
            ],
            onScrollEnd: loadMoreManagers,
            showLoader: loadingMoreManagers,
          },
        ]
      : []),
  ];

  /* ---------- SUBMIT ---------- */
  const submit = async () => {
    setSubmitAttempted(true);

    const newErrors: Record<string, string | null> = {};
    let hasErrors = false;

    fields.forEach((field) => {
      const error = validateField(field, form[field.name], form);
      newErrors[field.name] = error;
      if (error) hasErrors = true;
    });

    setErrors(newErrors);
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
        <div className="p-5 border-b">
          <h2 className="text-xl font-semibold">Edit Member</h2>
        </div>

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