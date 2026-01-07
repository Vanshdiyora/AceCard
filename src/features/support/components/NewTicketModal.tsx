import { useState, useEffect } from "react";
import { useAppDispatch } from "../../../app/hooks";
import { addTicket } from "../slice";
import DynamicForm, { type FieldConfig } from "../../../common/ui/DynamicForm";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function NewTicketModal({ open, onClose }: Props) {
  const dispatch = useAppDispatch();

  const [form, setForm] = useState({
    subject: "",
    priority: "medium",
    category: "technical",
    description: "",
  });

  // 🔒 Scroll lock when modal is open
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
      name: "subject",
      label: "Subject",
      type: "text",
      placeholder: "Enter subject",
    },
    {
      name: "priority",
      label: "Priority",
      type: "select",
      placeholder: "Select priority",
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
      placeholder: "Select category",
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
    const field = fields.find((f) => f.name === key);
    if (field?.type === "number") value = Number(value);

    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const submit = async () => {
    if (!form.subject || !form.description) {
      alert("Subject and description are required");
      return;
    }

    await dispatch(addTicket(form));
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-[480px] rounded-xl p-6 shadow-xl flex flex-col">

        <h2 className="text-xl font-semibold mb-4">Create Support Ticket</h2>

        <DynamicForm fields={fields} form={form} onChange={update} />

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
