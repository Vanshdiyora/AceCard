import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { updateAccountProfile } from "../slice";
import DynamicForm, {
  type FieldConfig,
} from "../../../common/ui/DynamicForm";
import { validateField } from "../../../common/utils/formValidator";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function EditAccountModal({ open, onClose }: Props) {
  const dispatch = useAppDispatch();
  const { data, saving } = useAppSelector(
    (s) => s.settings.account
  );

  const [form, setForm] = useState<any>({});
  const [errors, setErrors] = useState<
    Record<string, string | null>
  >({});

  /* ---------- INIT FORM ---------- */
  useEffect(() => {
    if (!data || !open) return;

    setForm({
      name: data.name ?? "",
      email: data.email ?? "",
      phone: data.phone ?? "",
      role: data.role ?? "",
      avatar_url: data.avatar_url ?? "",
      bio: data.bio ?? "",
      company_description: data.company_description ?? "",
      address: data.address ?? "",
    });

    setErrors({});
  }, [data, open]);

  /* ---------- SCROLL LOCK ---------- */
  useEffect(() => {
    if (open) lockScroll();
    else unlockScroll();
    return () => unlockScroll();
  }, [open]);

  if (!open) return null;

  /* ---------- UPDATE ---------- */
  const onChange = (key: string, value: any) => {
    setForm((prev: any) => ({ ...prev, [key]: value }));
  };

  /* ---------- SAVE ---------- */
  const save = () => {
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

    dispatch(updateAccountProfile(form));
    onClose();
  };

  /* ---------- UI ---------- */
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[85vh] flex flex-col">
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-semibold">
            Edit Account
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-black"
          >
            ✕
          </button>
        </div>

        <DynamicForm
          fields={fields}
          form={form}
          onChange={onChange}
          errors={errors}
          setErrors={setErrors}
        />

        <div className="px-6 py-4 border-t flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- FIELD CONFIG ---------- */
const fields: FieldConfig[] = [
  {
    name: "name",
    label: "Name",
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
    pattern: /^[0-9+\-()\s]{7,15}$/,
  },
  {
    name: "role",
    label: "Role",
    type: "text" as const,
    disabled: true, // usually not editable
  },
  {
    name: "avatar_url",
    label: "Avatar URL",
    type: "text" as const,
  },
  {
    name: "bio",
    label: "Bio",
    type: "textarea" as const,
    maxLength: 500,
  },
  {
    name: "company_description",
    label: "Company Description",
    type: "textarea" as const,
    maxLength: 1000,
  },
  {
    name: "address",
    label: "Address",
    type: "textarea" as const,
  },
];

/* ---------- SCROLL HELPERS ---------- */
const lockScroll = () => {
  const scrollbarWidth =
    window.innerWidth -
    document.documentElement.clientWidth;
  document.documentElement.style.overflow = "hidden";
  document.body.style.overflow = "hidden";
  document.body.style.paddingRight = `${scrollbarWidth}px`;
};

const unlockScroll = () => {
  document.documentElement.style.overflow = "";
  document.body.style.overflow = "";
  document.body.style.paddingRight = "";
};
