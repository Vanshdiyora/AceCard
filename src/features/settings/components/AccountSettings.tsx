import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { fetchAccountProfile, updateAccountProfile } from "../slice";

export default function AccountSettings() {
  const dispatch = useAppDispatch();
  const { data, loading, saving } = useAppSelector((s) => s.settings.account);

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    vendorName: "",
    pocName: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    dispatch(fetchAccountProfile());
  }, []);

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  const save = () => {
    dispatch(updateAccountProfile(form));
    setEditing(false);
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="bg-white shadow p-8 rounded-xl border">
      <h2 className="text-xl font-semibold mb-6">Account Settings</h2>

      {!editing ? (
        <>
          <p><strong>Vendor:</strong> {form.vendorName}</p>
          <p><strong>POC:</strong> {form.pocName}</p>
          <p><strong>Email:</strong> {form.email}</p>
          <p><strong>Phone:</strong> {form.phone}</p>

          <button onClick={() => setEditing(true)} className="mt-6 px-6 py-2 bg-purple-600 text-white rounded-lg">
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
                value={form[key as keyof typeof form]}
                onChange={(e) =>
                  setForm({ ...form, [key]: e.target.value })
                }
              />
            </div>
          ))}

          <button
            onClick={save}
            disabled={saving}
            className="mt-6 px-6 py-2 bg-purple-600 text-white rounded-lg"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </>
      )}
    </div>
  );
}
