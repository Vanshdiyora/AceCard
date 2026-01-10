import { useState, useEffect } from "react";
import { useAppDispatch } from "../../../app/hooks";
import { addTicket } from "../slice";
import DynamicForm, { type FieldConfig } from "../../../common/ui/DynamicForm";
import type { NewSupportTicketForm } from "../types";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function NewTicketModal({ open, onClose }: Props) {
  const dispatch = useAppDispatch();

  const [form, setForm] = useState<NewSupportTicketForm>({
    subject: "",
    priority: "medium",
    category: "technical",
    description: "",
  });

  const [error, setError] = useState<string | null>(null);

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

  if (!open) return null;

  const fields: FieldConfig[] = [
    {
      name: "subject", // ✅ matches backend
      label: "Subject",
      type: "text",
      placeholder: "Enter subject",
    },
    {
      name: "priority",
      label: "Priority",
      type: "select",
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
      type: "select",
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
      type: "textarea",
      placeholder: "Describe the issue...",
    },
  ];

  const update = (key: string, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError(null);
  };

  const submit = async () => {
    if (!form.subject.trim()) return setError("Subject is required");
    if (!form.description.trim()) return setError("Description is required");

    await dispatch(addTicket(form));
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-[480px] rounded-xl p-6 shadow-xl flex flex-col">
        <h2 className="text-xl font-semibold mb-1">Create Support Ticket</h2>

        <DynamicForm fields={fields} form={form} onChange={update} noValidate />

        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

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
