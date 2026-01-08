import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";

import { fetchTeam } from "../../teams/slice";
import { fetchProducts } from "../../products/slice";
import { fetchCampaigns } from "../../campaigns/slice";

import DynamicForm, { type FieldConfig } from "../../../common/ui/DynamicForm";

/* ------------------------------------------------------------------
   CUSTOM FORM CONFIG (ONLY CUSTOM FIELDS)
------------------------------------------------------------------ */
// type CustomFieldConfig = {
//   fieldId: string;
//   label: string;
//   type: FieldConfig["type"];
//   required: boolean;
//   archived: boolean;
//   options?: { label: string; value: any }[];
// };

// const leadFormConfig: { customFields: CustomFieldConfig[] } = {
//   customFields: [
//     {
//       fieldId: "radio_type",
//       label: "Radio type",
//       type: "radio",
//       required: true,
//       archived: false,
//       options: [
//         { label: "op1", value: "op1" },
//         { label: "op2", value: "op2" },
//       ],
//     },
//     {
//       fieldId: "dropdown_type_field",
//       label: "Dropdown Type field",
//       type: "select",
//       required: true,
//       archived: false,
//       options: [{ label: "OP1", value: "op1" }],
//     },
//     {
//       fieldId: "field_checkboxes",
//       label: "Field Checkboxes",
//       type: "multiselect",
//       required: false,
//       archived: false,
//       options: [
//         { label: "OP1", value: "op1" },
//         { label: "OP2", value: "op2" },
//         { label: "OP3", value: "op3" },
//       ],
//     },
//     {
//       fieldId: "type_date_time",
//       label: "Type Date Time",
//       type: "datetime",
//       required: true,
//       archived: false,
//     },
//     {
//       fieldId: "type_text",
//       label: "Type Text",
//       type: "text",
//       required: false,
//       archived: false,
//     },
//   ],
// };

export default function AddLeadModal({ open, onClose, onSubmit }: any) {
  const dispatch = useAppDispatch();

  const safeArray = <T,>(v: T[] | undefined | null): T[] =>
    Array.isArray(v) ? v : [];

  const campaigns = safeArray(useAppSelector((s) => s.campaigns.items));
  const members = safeArray(useAppSelector((s) => s.team.members));
  const products = safeArray(useAppSelector((s) => s.products.products));

  useEffect(() => {
    if (open) {
      dispatch(fetchTeam());
      dispatch(fetchProducts());
      dispatch(fetchCampaigns());
    }
  }, [dispatch, open]);

  /* ------------------------------------------------------------------
     FORM STATE (CUSTOM FIELDS STORED AT TOP LEVEL)
  ------------------------------------------------------------------ */
  const [form, setForm] = useState<Record<string, any>>({
    lead_name: "",
    phone: "",
    email: "",
    company: "",
    assigned_rep_id: null,
    product_ids: [],
    campaign_ids: [],
    deal_amount: 0,
    source: "manual",
  });

  /* ------------------------------------------------------------------
     FORM UPDATER (🔥 FIXED)
  ------------------------------------------------------------------ */
  const update = (key: string, value: any) => {
    if (key === "deal_amount") {
      value = Number(value);
    }

    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  /* ------------------------------------------------------------------
     CUSTOM FIELD CONFIG → DynamicForm Fields
  ------------------------------------------------------------------ */
  // const customFieldConfigs: FieldConfig[] =
  //   leadFormConfig.customFields
  //     .filter((f) => !f.archived)
  //     .map((f) => ({
  //       name: `custom_${f.fieldId}`,
  //       label: f.label,
  //       type: f.type,
  //       required: f.required,
  //       options: f.options,
  //       placeholder: `Enter ${f.label}`,
  //     }));

  /* ------------------------------------------------------------------
     BASE + CUSTOM FIELDS
  ------------------------------------------------------------------ */
  const fields: FieldConfig[] = [
    {
      name: "lead_name",
      label: "Lead Name",
      type: "text",
      placeholder: "Enter lead name",
    },
    {
      name: "company",
      label: "Company",
      type: "text",
      placeholder: "Enter company name",
    },
    {
      name: "email",
      label: "Email",
      type: "email",
      placeholder: "Enter email address",
    },
    {
      name: "phone",
      label: "Phone",
      type: "text",
      placeholder: "Enter phone number",
    },
    {
      name: "assigned_rep_id",
      label: "Assigned Representative",
      type: "select",
      options: members.map((m) => ({
        label: m.name,
        value: m.id,
      })),
    },
    {
      name: "campaign_ids",
      label: "Campaigns",
      type: "multiselect",
      options: campaigns.map((c: any) => ({
        label: c.name,
        value: c.id,
      })),
    },
    {
      name: "product_ids",
      label: "Products",
      type: "multiselect",
      options: products.map((p: any) => ({
        label: p.name,
        value: p.id,
      })),
    },
    {
      name: "deal_amount",
      label: "Deal Amount",
      type: "number",
    },
    {
      name: "source",
      label: "Source",
      type: "select",
      options: [
        { label: "Manual", value: "manual" },
        { label: "Voice", value: "voice" },
        { label: "OCR", value: "ocr" },
        { label: "Tap Event", value: "tap" },
        { label: "CSV Import", value: "csv" },
      ],
    },

    // ✅ append custom fields
    // ...customFieldConfigs,
  ];

  /* ------------------------------------------------------------------
     SUBMIT HANDLER (🔥 EXTRACT CUSTOM FIELDS HERE)
  ------------------------------------------------------------------ */
  const handleSubmit = () => {
    const customFields: Record<string, any> = {};

    Object.keys(form).forEach((key) => {
      if (key.startsWith("custom_")) {
        customFields[key.replace("custom_", "")] = form[key];
      }
    });

    const payload = {
      lead_name: form.lead_name,
      phone: form.phone,
      email: form.email,
      company: form.company,
      assigned_rep_id: Number(form.assigned_rep_id) || null,

      products: form.product_ids.map(Number),
      campaigns: form.campaign_ids.map(Number),

      deal_amount: Number(form.deal_amount) || 0,
      source: form.source,

      // custom_fields: customFields,
    };

    onSubmit(payload);
  };

  if (!open) return null;

  /* ------------------------------------------------------------------
     UI
  ------------------------------------------------------------------ */
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4 z-50">
      <div className="bg-white w-[550px] max-h-[90vh] overflow-y-auto rounded-xl shadow-xl p-6 space-y-6">
        <div className="flex justify-between items-center pb-3 border-b">
          <h2 className="text-xl font-semibold">Create Lead</h2>
          <button onClick={onClose}>✕</button>
        </div>

        <DynamicForm form={form} fields={fields} onChange={update} />

        <div className="pt-4 border-t flex justify-end gap-2">
          <button onClick={onClose}>Cancel</button>
          <button
            className="px-4 py-2 bg-purple-600 text-white rounded"
            onClick={handleSubmit}
          >
            Create Lead
          </button>
        </div>
      </div>
    </div>
  );
}
