import { useState, useEffect } from "react";
import { useAppDispatch } from "../../../app/hooks";
import { createVendor } from "../slice";
import DynamicForm, { type FieldConfig } from "../../../common/ui/DynamicForm";
import { validateField } from "../../../common/utils/formValidator";
import type { VendorItem } from "../types";

interface AddVendorModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onError: (msg: string) => void;
  setProcessing: (v: boolean) => void;
}

type VendorForm = Partial<VendorItem>;

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
    gst: "", // ✅ GST added
    primary_email: "",
    primary_phone: "",
    payment_terms: "",
    vendor_poc_email: "",
    vendor_poc_name: "",
    pricing_per_card: undefined,
    subscription_end_date: "",
    allowed_crm_integrations: [],
  });

  const [errors, setErrors] = useState<Record<string, string | null>>({});

  /* ---------- BODY SCROLL LOCK ---------- */
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  /* ---------- RESET ---------- */
  useEffect(() => {
    if (!open) return;
    setErrors({});
  }, [open]);

  if (!open) return null;

  /* ---------- FIELD CONFIG ---------- */
  const fields: FieldConfig[] = [
    {
      name: "legal_name",
      label: "Legal Name",
      type: "text",
      placeholder: "Enter legal company name",
      required: true,
      minLength: 2,
    },
    {
      name: "address",
      label: "Address",
      type: "text",
      placeholder: "Enter registered business address",
      required: true,
    },

    // ✅ GST FIELD
    {
      name: "gst",
      label: "GST Number",
      type: "text",
      placeholder: "27AAPFU0939F1ZV",
      required: false,
      pattern:
        /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
      patternMessage: "Enter a valid GST number",
    },

    {
      name: "primary_email",
      label: "Primary Email",
      type: "email",
      placeholder: "contact@company.com",
      required: true,
    },
    {
      name: "primary_phone",
      label: "Primary Phone",
      type: "text",
      placeholder: "Enter primary contact number",
      required: true,
      pattern: /^[0-9+\-()\s]{7,15}$/,
    },
    {
      name: "payment_terms",
      label: "Payment Terms",
      type: "select",
      required: true,
      placeholder: "Select payment terms",
      options: [
        { label: "Monthly", value: "monthly" },
        { label: "Annually", value: "annually" },
      ],
    },
    {
      name: "vendor_poc_name",
      label: "Vendor POC Name",
      type: "text",
      required: true,
      placeholder: "Enter point of contact name",
      minLength: 2,
    },
    {
      name: "pricing_per_card",
      label: "Price per Card",
      type: "number",
      required: true,
      placeholder: "Enter price per card",
      min: 1,
    },
    {
      name: "vendor_poc_email",
      label: "Vendor POC Email",
      type: "email",
      required: true,
      placeholder: "poc@company.com",
    },
    {
      name: "subscription_end_date",
      label: "Subscription End Date",
      type: "date",
      required: true,
      placeholder: "Select subscription end date",
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
        { label: "Odoo", value: "odoo" },
      ],
    },
  ];

  /* ---------- UPDATE ---------- */
  const update = (key: string, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  /* ---------- SAVE ---------- */
  const save = async () => {
    const hasErrors = fields.some((field) => {
      const error = validateField(
        field,
        form[field.name as keyof VendorForm],
        form
      );

      setErrors((prev) => ({
        ...prev,
        [field.name]: error,
      }));

      return error;
    });

    if (hasErrors) return;

    try {
      setProcessing(true);

      const payload = {
        ...form,
        vendor_poc_name: form.vendor_poc_name?.trim(),
        vendor_poc_email: form.vendor_poc_email?.trim(),
        gst: form.gst?.trim() || undefined,
        subscription_end_date: form.subscription_end_date
          ? new Date(form.subscription_end_date).toISOString()
          : undefined,
        allowed_crm_integrations:
          form.allowed_crm_integrations?.length
            ? form.allowed_crm_integrations
            : ["none"],
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

  /* ---------- UI ---------- */
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-[450px] max-h-[90vh] rounded-xl shadow-lg flex flex-col">
        <div className="p-5 border-b">
          <h2 className="text-xl font-semibold">Add Vendor</h2>
        </div>

        <div className="flex-1 overflow-y-auto">
          <DynamicForm
            fields={fields}
            form={form}
            onChange={update}
            errors={errors}
            setErrors={setErrors}
          />
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
