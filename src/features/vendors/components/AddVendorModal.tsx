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

type VendorForm = Partial<VendorItem> & { password?: string };

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
    allowed_crm_integrations: [], // keep empty so placeholder shows
    password: "",
  });

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);
  const fields: FieldConfig[] = [
    {
      name: "legal_name",
      label: "Legal Name",
      type: "text",
      placeholder: "Enter legal company name",
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
      placeholder: "Enter primary contact number",
    },
    {
      name: "payment_terms",
      label: "Payment Terms",
      type: "select",
      placeholder: "Select payment terms",
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
      name: "allowed_crm_integrations",
      label: "CRM Systems",
      type: "multiselect",
      placeholder: "Select CRM systems (optional)",
      options: [
        { label: "Zoho", value: "zoho" },
        { label: "HubSpot", value: "hubspot" },
        { label: "Salesforce", value: "salesforce" },
        { label: "Custom", value: "custom" },
      ],
    },
  ];


  const update = (key: string, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const save = async () => {
    try {
      setProcessing(true);

      const payload = {
        ...form,
        allowed_crm_integrations:
          form.allowed_crm_integrations && form.allowed_crm_integrations.length > 0
            ? form.allowed_crm_integrations
            : ["none"], // fallback only in payload
      };

      await dispatch(createVendor(payload)).unwrap();
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

        <div className="flex-1 overflow-y-auto">
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
