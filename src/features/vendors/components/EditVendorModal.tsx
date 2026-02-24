import { useState, useEffect } from "react";
import { useAppDispatch } from "../../../app/hooks";
import { updateVendor } from "../slice";
import DynamicForm, {
  type FieldConfig,
} from "../../../common/ui/DynamicForm";
import { validateField } from "../../../common/utils/formValidator";
import { uploadImage } from "../../publicProfile/services/publicProfile.api";
import type { VendorItem } from "../types";

type Props = {
  vendor: VendorItem;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

type VendorForm = Partial<VendorItem>;

export default function EditVendorModal({
  vendor,
  open,
  onClose,
  onSuccess,
}: Props) {
  const dispatch = useAppDispatch();

  const [form, setForm] = useState<VendorForm>({});
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false); // ✅ ADD

  /* ---------- BODY SCROLL LOCK ---------- */
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  /* ---------- INIT ---------- */
  useEffect(() => {
    if (!open || !vendor) return;

    setForm({
      ...vendor,
      subscription_end_date: vendor.subscription_end_date
        ? vendor.subscription_end_date.split("T")[0]
        : "",
    });

    setErrors({});
    setSubmitAttempted(false); // ✅ RESET on open
  }, [vendor, open]);

  if (!open || !vendor) return null;

  /* ---------- FIELD CONFIG ---------- */
  const fields: FieldConfig[] = [
    {
      name: "avatar",
      label: "Vendor Profile Image",
      type: "image",
      upload: async (file: File) => {
        const res = await uploadImage(file);
        return res.data.url;
      },
    },
    { name: "legal_name", label: "Legal Name", type: "text", required: true, minLength: 2 },
    { name: "address", label: "Address", type: "text", required: true },
    {
      name: "gst",
      label: "GST Number",
      type: "text",
      pattern: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
      patternMessage: "Enter a valid GST number",
    },
    { name: "primary_email", label: "Primary Email", type: "email", required: true },
    { name: "primary_phone", label: "Primary Phone", type: "number", required: true },
    {
      name: "payment_terms",
      label: "Payment Terms",
      type: "select",
      required: true,
      options: [
        { label: "Monthly", value: "monthly" },
        { label: "Quarterly", value: "quarterly" },
        { label: "Semi-Annually", value: "semiannually" },
        { label: "Annually", value: "annually" },
      ],
    },
    { name: "vendor_poc_name", label: "Vendor POC Name", type: "text", required: true },
    { name: "pricing_per_card", label: "Price per Card", type: "number", required: true, min: 1 },
    {
      name: "vendor_poc_email",
      label: "Vendor POC Email",
      type: "email",
      required: true,
      validate: (value, form) => {
        if (
          value &&
          form.primary_email &&
          value.trim().toLowerCase() === form.primary_email.trim().toLowerCase()
        ) {
          return "Vendor POC Email must be different from Primary Email";
        }
        return null;
      },
    },
    {
      name: "subscription_end_date",
      label: "Subscription End Date",
      type: "date",
      required: true,
    },
    {
      name: "allowed_crm_integrations",
      label: "CRM Systems",
      type: "search-multiselect",
      placeholder: "Search & select CRM systems",
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
    setForm((prev) => {
      const updated = { ...prev, [key]: value };

      if (key === "primary_email" || key === "vendor_poc_email") {
        const pocField = fields.find((f) => f.name === "vendor_poc_email");
        if (pocField?.validate) {
          const pocValue = key === "vendor_poc_email" ? value : prev.vendor_poc_email;
          const primaryValue = key === "primary_email" ? value : prev.primary_email;
          const error = pocField.validate(pocValue, { ...updated, primary_email: primaryValue });
          setErrors((prev) => ({ ...prev, vendor_poc_email: error }));
        }
      }

      return updated;
    });
  };

  /* ---------- SAVE ---------- */
  const save = async () => {
    setSubmitAttempted(true); // ✅ ADD

    // ✅ Collect all errors at once into a single object
    const newErrors: Record<string, string | null> = {};
    let hasErrors = false;

    fields.forEach((field) => {
      const error = validateField(
        field,
        form[field.name as keyof VendorForm],
        form
      );
      newErrors[field.name] = error;
      if (error) hasErrors = true;
    });

    setErrors(newErrors); // ✅ Single state update

    if (hasErrors) return;

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
          : [],
    };

    const res = await dispatch(
      updateVendor({ id: vendor.id, data: payload })
    );

    if (updateVendor.fulfilled.match(res)) {
      onSuccess?.();
      onClose();
    }
  };

  /* ---------- UI ---------- */
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-[450px] max-h-[90vh] rounded-xl shadow-lg flex flex-col">

        <div className="p-5 border-b">
          <h2 className="text-xl font-semibold">Edit Vendor</h2>
        </div>

        <div className="flex-1 overflow-y-auto">
          <DynamicForm
            fields={fields}
            form={form}
            onChange={update}
            errors={errors}
            setErrors={setErrors}
            submitAttempted={submitAttempted} // ✅ ADD
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
            Update
          </button>
        </div>
      </div>
    </div>
  );
}