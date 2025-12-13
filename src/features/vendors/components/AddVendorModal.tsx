import DynamicForm, { type FieldConfig } from "../../../common/ui/DynamicForm";
import { useState } from "react";
import { useAppDispatch } from "../../../app/hooks";
import { createVendor, fetchVendors } from "../slice";
import type { VendorItem } from "../types";

interface AddVendorModalProps {
  open: boolean;
  onClose: () => void;
}

type VendorForm = Partial<VendorItem> & {
  password?: string;
};

export default function AddVendorModal({ open, onClose }: AddVendorModalProps) {
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

  const fields: FieldConfig[] = [
    {
      name: "legal_name",
      label: "Legal Name",
      type: "text",
      placeholder: "Enter legal registered name",
    },
    {
      name: "address",
      label: "Address",
      type: "text",
      placeholder: "Enter vendor's address",
    },
    {
      name: "primary_email",
      label: "Primary Email",
      type: "email",
      placeholder: "Enter main company email",
    },
    {
      name: "primary_phone",
      label: "Primary Phone",
      type: "text",
      placeholder: "Enter main contact number",
    },
 
    {
      name: "payment_terms",
      label: "Payment Terms",
      type: "text",
      placeholder: "Ex: Net 30 / Monthly / Quarterly",
    },
    
    {
      name: "vendor_poc_email",
      label: "Vendor POC Email",
      type: "email",
      placeholder: "Enter email of vendor's point of contact",
    },
    {
      name: "password",
      label: "Password",
      type: "text", // ❗ I can upgrade DynamicForm to support password if you want
      placeholder: "Enter temporary vendor password",
    },

    {
      name: "crm_system",
      label: "CRM System",
      type: "select",
      placeholder: "Select CRM",
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
    await dispatch(createVendor(form));
    dispatch(fetchVendors());
    onClose();
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
          <button
            className="px-4 py-2 bg-purple-600 text-white rounded"
            onClick={save}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
