import { useState } from "react";
export default function PermissionsModal({
  open,
  permissions,
  onClose,
  onSubmit,
}: {
  open: boolean;
  permissions: any;
  onClose: () => void;
  onSubmit: (data: any) => void;
}) {
  if (!open) return null;

  const [form, setForm] = useState(permissions);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl w-96 shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Update Permissions</h2>

        {Object.keys(form).map((key) => (
          <label key={key} className="flex items-center gap-2 mb-2">
            <input
              type="checkbox"
              checked={form[key]}
              onChange={(e) =>
                setForm({ ...form, [key]: e.target.checked })
              }
            />
            {key.replace("_", " ")}
          </label>
        ))}

        <div className="flex justify-end gap-2 mt-4">
          <button className="px-4 py-2 border rounded" onClick={onClose}>
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-purple-600 text-white rounded"
            onClick={() => onSubmit(form)}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
