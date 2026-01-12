import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { updateAccountProfile } from "../slice";
import DynamicForm, { type FieldConfig } from "../../../common/ui/DynamicForm";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function EditAccountModal({ open, onClose }: Props) {
  const dispatch = useAppDispatch();
  const { data, saving } = useAppSelector((s) => s.settings.account);
  const [form, setForm] = useState<any>({});

  useEffect(() => {
    if (data && open) {
      setForm({
        name: data.name,
        email: data.email,
        phone: data.phone,
        role: data.role,
        avatar_url: data.avatar_url,
        bio: data.bio,
        company_description: data.company_description,
        address: data.address,
      });
    }
  }, [data, open]);

  useEffect(() => {
    if (open) lockScroll();
    else unlockScroll();

    return () => unlockScroll();
  }, [open]);

  const onChange = (key: string, value: any) => {
    setForm((prev: any) => ({ ...prev, [key]: value }));
  };

  const save = () => {
    dispatch(updateAccountProfile(form));
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[85vh] flex flex-col">
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-semibold">Edit Account</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-black">
            ✕
          </button>
        </div>

        <DynamicForm fields={fields} form={form} onChange={onChange} />

        <div className="px-6 py-4 border-t flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 border rounded-lg">
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

const fields: FieldConfig[] = [
  { name: "name", label: "Name", type: "text" },
  { name: "email", label: "Email", type: "email" },
  { name: "phone", label: "Phone", type: "text" },
  { name: "role", label: "Role", type: "text" },
  { name: "avatar_url", label: "Avatar URL", type: "text" },
  { name: "bio", label: "Bio", type: "textarea" },
  { name: "company_description", label: "Company Description", type: "textarea" },
  { name: "address", label: "Address", type: "textarea" },
];

const lockScroll = () => {
  const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
  document.documentElement.style.overflow = "hidden";
  document.body.style.overflow = "hidden";
  document.body.style.paddingRight = `${scrollbarWidth}px`;
};

const unlockScroll = () => {
  document.documentElement.style.overflow = "";
  document.body.style.overflow = "";
  document.body.style.paddingRight = "";
};
