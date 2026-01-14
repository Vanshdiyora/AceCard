import { useState } from "react";
import { useAppDispatch } from "../../../app/hooks";
import { connectIntegration } from "../slice";

interface Props {
  onClose: () => void;
}

export default function OdooConnectModal({ onClose }: Props) {
  const dispatch = useAppDispatch();

  const [form, setForm] = useState({
    url: "",
    db: "",
    email: "",
    username: "",
    api_key: "",
  });

  const submit = async () => {
    if (
      !form.url ||
      !form.db ||
      !form.email ||
      !form.username ||
      !form.api_key
    ) {
      alert("All fields are required");
      return;
    }

    await dispatch(
      connectIntegration({ provider: "odoo", payload: form })
    ).unwrap();

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-[400px] space-y-4">
        <h3 className="text-lg font-semibold">Connect Odoo</h3>

        <input
          placeholder="Odoo URL"
          className="w-full border p-2 rounded"
          value={form.url}
          onChange={(e) => setForm({ ...form, url: e.target.value })}
        />

        <input
          placeholder="Database name"
          className="w-full border p-2 rounded"
          value={form.db}
          onChange={(e) => setForm({ ...form, db : e.target.value })}
        />

        <input
          placeholder="Login email"
          className="w-full border p-2 rounded"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <input
          placeholder="Username"
          className="w-full border p-2 rounded"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
        />

        <input
          placeholder="API key"
          type="password"
          className="w-full border p-2 rounded"
          value={form.api_key}
          onChange={(e) => setForm({ ...form, api_key: e.target.value })}
        />

        <div className="flex justify-end gap-2 pt-4">
          <button onClick={onClose} className="px-4 py-1 border rounded">
            Cancel
          </button>
          <button
            onClick={submit}
            className="px-4 py-1 bg-purple-600 text-white rounded"
          >
            Connect
          </button>
        </div>
      </div>
    </div>
  );
}
