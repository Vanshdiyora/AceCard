import DynamicForm, { type FieldConfig } from "../../../common/ui/DynamicForm";
import { useState, useEffect } from "react";
import { useAppDispatch } from "../../../app/hooks";
import { createVendor } from "../slice";
import type { VendorItem } from "../types";

interface AddVendorModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onError: (msg: string) => void;
  setProcessing: (v: boolean) => void;
}

type VendorForm = Partial<VendorItem> & {
  password?: string;
};

export default function AddVendorModal({
  open,
  onClose,
  onSuccess,
  onError,
  setProcessing,
}: AddVendorModalProps) {
  const dispatch = useAppDispatch();

  const [form, setForm] = useState<VendorForm>({
    legal_name: "",
    address: "",
    primary_email: "",
    primary_phone: "",
    payment_terms: "",
    vendor_poc_email: "",
    crm_system: "none",
    password: "",
  });

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  const fields: FieldConfig[] = [
    {
      name: "legal_name",
      label: "Legal Name",
      type: "text",
      placeholder: "Enter company legal name",
    },
    {
      name: "address",
      label: "Address",
      type: "text",
      placeholder: "Enter registered business address",
    },
    {
      name: "primary_email",
      label: "Primary Email",
      type: "email",
      placeholder: "contact@company.com",
    },
    {
      name: "primary_phone",
      label: "Primary Phone",
      type: "text",
      placeholder: "Mobile Number",
    },
    {
      name: "payment_terms",
      label: "Payment Terms",
      type: "select",
      placeholder: "Select payment frequency",
      options: [
        { label: "Monthly", value: "monthly" },
        { label: "Annually", value: "annually" },
      ],
    },
    {
      name: "vendor_poc_email",
      label: "Vendor POC Email",
      type: "email",
      placeholder: "poc@company.com",
    },
    {
      name: "password",
      label: "Password",
      type: "text",
      placeholder: "Set a temporary password",
    },
    {
      name: "crm_system",
      label: "CRM System",
      type: "select",
      placeholder: "Choose CRM (optional)",
      options: [
        { label: "None", value: "none" },
        { label: "Zoho", value: "zoho" },
        { label: "HubSpot", value: "hubspot" },
        { label: "Salesforce", value: "salesforce" },
      ],
    },
  ];


  const update = (key: string, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const save = async () => {
    try {
      setProcessing(true);
      await dispatch(createVendor(form)).unwrap();
      onSuccess();
      onClose();
    } catch (err: any) {
      onError(err?.message || "Failed to create vendor.");
    } finally {
      setProcessing(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-[450px] max-h-[90vh] rounded-xl shadow-lg flex flex-col">
        <div className="p-5 border-b">
          <h2 className="text-xl font-semibold">Add Vendor</h2>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-3">
          <DynamicForm fields={fields} form={form} onChange={update} />
        </div>

        <div className="p-4 border-t flex justify-end gap-3">
          <button className="px-4 py-2 border rounded" onClick={onClose}>
            Cancel
          </button>
          <button className="px-4 py-2 bg-purple-600 text-white rounded" onClick={save}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
