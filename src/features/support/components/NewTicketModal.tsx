import { useState } from "react";
import { useAppDispatch } from "../../../app/hooks";
import { addTicket } from "../slice";

export default function NewTicketModal({ open, onClose }: any) {
  const dispatch = useAppDispatch();

  if (!open) return null;

  const [form, setForm] = useState({
    subject: "",
    priority: "medium",
    category: "technical",
    description: "",
  });

  const update = (key: string, value: any) =>
    setForm({ ...form, [key]: value });

  const submit = async () => {
    if (!form.subject || !form.description) {
      alert("Subject and description are required");
      return;
    }

    await dispatch(addTicket(form));
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white w-[480px] rounded-xl p-6 shadow-xl">
        <h2 className="text-xl font-semibold mb-4">Create Support Ticket</h2>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Subject</label>
            <input
              type="text"
              value={form.subject}
              onChange={(e) => update("subject", e.target.value)}
              className="w-full border rounded-lg p-2 mt-1"
              placeholder="Enter subject"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Priority</label>
            <select
              value={form.priority}
              onChange={(e) => update("priority", e.target.value)}
              className="w-full border rounded-lg p-2 mt-1"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">Category</label>
            <select
              value={form.category}
              onChange={(e) => update("category", e.target.value)}
              className="w-full border rounded-lg p-2 mt-1"
            >
              <option value="technical">Technical</option>
              <option value="billing">Billing</option>
              <option value="feature_request">Feature Request</option>
              <option value="general">General</option>
              <option value="others">Others</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              className="w-full border rounded-lg p-2 mt-1"
              rows={4}
              placeholder="Describe the issue..."
            ></textarea>
          </div>
        </div>

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
