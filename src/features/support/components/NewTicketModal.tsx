import { useState, useEffect } from "react";
import { useAppDispatch } from "../../../app/hooks";
import { addTicket } from "../slice";
import DynamicForm, {
  type FieldConfig,
} from "../../../common/ui/DynamicForm";
import { validateField } from "../../../common/utils/formValidator";
import type { NewSupportTicketForm } from "../types";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmitStart?: () => void;
  onSubmitEnd?: (success: boolean, message: string) => void;
}

export default function NewTicketModal({
  open,
  onClose,
  onSubmitStart,
  onSubmitEnd,
}: Props) {
  const dispatch = useAppDispatch();

  const [form, setForm] = useState<NewSupportTicketForm>({
    subject: "",
    priority: "medium",
    category: "technical",
    description: "",
  });

  const [errors, setErrors] = useState<
    Record<string, string | null>
  >({});
 const [submitAttempted, setSubmitAttempted] = useState(false);

  /* ---------- BODY SCROLL LOCK ---------- */
  useEffect(() => {
    if (!open) return;
    const scrollY = window.scrollY;
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";
    return () => {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      window.scrollTo(0, scrollY);
    };
  }, [open]);

  /* ---------- RESET FORM ---------- */
  useEffect(() => {
    if (!open) return;

    setForm({
      subject: "",
      priority: "medium",
      category: "technical",
      description: "",
    });
    setSubmitAttempted(false);
    setErrors({});
  }, [open]);

  if (!open) return null;

  /* ---------- FIELD CONFIG ---------- */
  const fields: FieldConfig[] = [
    {
      name: "subject",
      label: "Subject",
      type: "text" as const,
      placeholder: "Enter subject",
      required: true,
      minLength: 3,
    },
    {
      name: "priority",
      label: "Priority",
      type: "select" as const,
      required: true,
      options: [
        { label: "Low", value: "low" },
        { label: "Medium", value: "medium" },
        { label: "High", value: "high" },
        { label: "Critical", value: "critical" },
      ],
    },
    {
      name: "category",
      label: "Category",
      type: "select" as const,
      required: true,
      options: [
        { label: "Technical", value: "technical" },
        { label: "Billing", value: "billing" },
        { label: "Feature Request", value: "feature_request" },
        { label: "General", value: "general" },
        { label: "Others", value: "others" },
      ],
    },
    {
      name: "description",
      label: "Description",
      type: "textarea" as const,
      placeholder: "Describe the issue...",
      required: true,
      minLength: 10,
    },
  ];

  /* ---------- UPDATE ---------- */
  const update = (key: string, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  /* ---------- SUBMIT ---------- */
 const submit = async () => {
    setSubmitAttempted(true); // ✅ ADD

    // ✅ Collect all errors at once
    const newErrors: Record<string, string | null> = {};
    let hasErrors = false;

    fields.forEach((field) => {
      const error = validateField(
        field,
        form[field.name as keyof NewSupportTicketForm],
        form
      );
      newErrors[field.name] = error;
      if (error) hasErrors = true;
    });

    setErrors(newErrors); // ✅ Single update

    if (hasErrors) return;

    try {
      onSubmitStart?.();
      await dispatch(addTicket(form)).unwrap();
      onSubmitEnd?.(true, "Ticket created successfully");
      onClose();
    } catch {
      onSubmitEnd?.(false, "Failed to create ticket");
    }
  };
  /* ---------- UI ---------- */
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-[480px] rounded-xl p-6 shadow-xl flex flex-col">
        <h2 className="text-xl font-semibold mb-1">
          Create Support Ticket
        </h2>

        <DynamicForm
          fields={fields}
          form={form}
          onChange={update}
          errors={errors}
          setErrors={setErrors}
           submitAttempted={submitAttempted} 
        />

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg"
          >
            Create Ticket
          </button>
        </div>
      </div>
    </div>
  );
}
