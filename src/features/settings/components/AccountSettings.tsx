import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { fetchAccountProfile, updateAccountProfile } from "../slice";
import BrandLoader from "../../../common/ui/BrandLoader";

type AccountForm = {
  name: string;
  email: string;
  phone: string;
  role: string;
  avatar_url: string;
  bio: string;
  company_description: string;
  socials: string;
  other_links: string;
  display_settings: string;
  address: string;
};

const EMPTY_FORM: AccountForm = {
  name: "",
  email: "",
  phone: "",
  role: "",
  avatar_url: "",
  bio: "",
  company_description: "",
  socials: "",
  other_links: "",
  display_settings: "",
  address: "",
};

export default function AccountSettings() {
  const dispatch = useAppDispatch();
  const { data, loading, saving } = useAppSelector((s) => s.settings.account);

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<AccountForm>(EMPTY_FORM);

  useEffect(() => {
    dispatch(fetchAccountProfile());
  }, [dispatch]);

  useEffect(() => {
    if (data) {
      setForm({
        name: data.name ?? "",
        email: data.email ?? "",
        phone: data.phone ?? "",
        role: data.role ?? "",
        avatar_url: data.avatar_url ?? "",
        bio: data.bio ?? "",
        company_description: data.company_description ?? "",
        socials: JSON.stringify(data.socials ?? "", null, 2),
        other_links: JSON.stringify(data.other_links ?? "", null, 2),
        display_settings: JSON.stringify(data.display_settings ?? "", null, 2),
        address: data.address ?? "",
      });
    }
  }, [data]);

  const save = () => {
    const payload = {
      ...form,
      socials: tryParse(form.socials),
      other_links: tryParse(form.other_links),
      display_settings: tryParse(form.display_settings),
    };

    dispatch(updateAccountProfile(payload as any));
    setEditing(false);
  };

  const cancel = () => {
    if (data) {
      setForm({
        name: data.name ?? "",
        email: data.email ?? "",
        phone: data.phone ?? "",
        role: data.role ?? "",
        avatar_url: data.avatar_url ?? "",
        bio: data.bio ?? "",
        company_description: data.company_description ?? "",
        socials: JSON.stringify(data.socials ?? "", null, 2),
        other_links: JSON.stringify(data.other_links ?? "", null, 2),
        display_settings: JSON.stringify(data.display_settings ?? "", null, 2),
        address: data.address ?? "",
      });
    }
    setEditing(false);
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <BrandLoader />
      </div>
    );


  return (
    <div className="bg-white shadow p-8 rounded-xl">
      <h2 className="text-xl font-semibold mb-6">Account Settings</h2>

      {!editing ? (
        <div className="space-y-2">
          {renderView("Name", form.name)}
          {renderView("Email", form.email)}
          {renderView("Phone", form.phone)}
          {renderView("Role", form.role)}
          {renderView("Avatar URL", form.avatar_url)}
          {renderView("Bio", form.bio)}
          {renderView("Company Description", form.company_description)}
          {renderView("Address", form.address)}

          <button
            onClick={() => setEditing(true)}
            className="mt-6 px-6 py-2 bg-purple-600 text-white rounded-lg"
          >
            Edit
          </button>
        </div>
      ) : (
        <>
          {renderInput("Name", "name", form, setForm)}
          {renderInput("Email", "email", form, setForm)}
          {renderInput("Phone", "phone", form, setForm)}
          {renderInput("Role", "role", form, setForm)}
          {renderInput("Avatar URL", "avatar_url", form, setForm)}
          {renderTextarea("Bio", "bio", form, setForm)}
          {renderTextarea(
            "Company Description",
            "company_description",
            form,
            setForm
          )}
          {/* {renderTextarea("Address", "address", form, setForm)}
          {renderTextarea("Socials (JSON)", "socials", form, setForm)}
          {renderTextarea("Other Links (JSON)", "other_links", form, setForm)}
          {renderTextarea(
            "Display Settings (JSON)",
            "display_settings",
            form,
            setForm
          )} */}

          <div className="flex gap-4 mt-6">
            <button
              onClick={save}
              disabled={saving}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg"
            >
              {saving ? "Saving..." : "Save"}
            </button>

            <button
              onClick={cancel}
              className="px-6 py-2 border rounded-lg"
            >
              Cancel
            </button>
          </div>
        </>
      )}
    </div>
  );
}

/* ---------- Helpers ---------- */

function renderView(label: string, value: string) {
  return (
    <p>
      <strong>{label}:</strong>{" "}
      {value || <span className="text-gray-400">—</span>}
    </p>
  );
}

function renderInput(
  label: string,
  field: keyof AccountForm,
  form: AccountForm,
  setForm: React.Dispatch<React.SetStateAction<AccountForm>>
) {
  return (
    <div className="mb-4">
      <label className="block text-sm mb-1">{label}</label>
      <input
        className="border rounded-lg w-full px-3 py-2"
        value={form[field]}
        onChange={(e) =>
          setForm((prev) => ({ ...prev, [field]: e.target.value }))
        }
      />
    </div>
  );
}

function renderTextarea(
  label: string,
  field: keyof AccountForm,
  form: AccountForm,
  setForm: React.Dispatch<React.SetStateAction<AccountForm>>
) {
  return (
    <div className="mb-4">
      <label className="block text-sm mb-1">{label}</label>
      <textarea
        className="border rounded-lg w-full px-3 py-2 h-24"
        value={form[field]}
        onChange={(e) =>
          setForm((prev) => ({ ...prev, [field]: e.target.value }))
        }
      />
    </div>
  );
}

function tryParse(v: string) {
  try {
    return JSON.parse(v);
  } catch {
    return v;
  }
}
