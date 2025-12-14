import { useState } from "react";

export default function VendorInformation() {
  const [editing, setEditing] = useState(false);

  const [form, setForm] = useState({
    company: "Acme Corp",
    industry: "Technology",
    address: "123 Corporate Road, Mumbai",
  });

  return (
    <div className="bg-white shadow p-8 rounded-xl border">
      <h2 className="text-xl font-semibold mb-6">Vendor Information</h2>

      {!editing ? (
        <>
          <p><strong>Company:</strong> {form.company}</p>
          <p><strong>Industry:</strong> {form.industry}</p>
          <p><strong>Address:</strong> {form.address}</p>

          <button
            className="mt-6 px-6 py-2 bg-purple-600 text-white rounded-lg"
            onClick={() => setEditing(true)}
          >
            Edit
          </button>
        </>
      ) : (
        <>
          {Object.keys(form).map((key) => (
            <div className="mb-4" key={key}>
              <label className="block text-sm mb-1 capitalize">{key}</label>
              <input
                className="border rounded-lg w-full px-3 py-2"
                value={form[key]}
                onChange={(e) =>
                  setForm({ ...form, [key]: e.target.value })
                }
              />
            </div>
          ))}

          <button
            onClick={() => setEditing(false)}
            className="mt-6 px-6 py-2 bg-purple-600 text-white rounded-lg"
          >
            Save
          </button>
        </>
      )}
    </div>
  );
}
