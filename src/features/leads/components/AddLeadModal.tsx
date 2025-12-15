import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";

import { fetchTeam } from "../../teams/slice";
import { fetchProducts } from "../../products/slice";
import { fetchCampaigns } from "../../campaigns/slice";

import DynamicForm, { type FieldConfig } from "../../../common/ui/DynamicForm";
import { LEAD_STAGES } from "../constants";

export default function AddLeadModal({ open, onClose, onSubmit }: any) {
  const dispatch = useAppDispatch();

  // Team
  const { members } = useAppSelector((s) => s.team);

  // Products
  const { products } = useAppSelector((s) => s.products);

  // Campaigns
  const { items: campaigns } = useAppSelector((s) => s.campaigns);

  useEffect(() => {
    if(open){

      dispatch(fetchTeam());
      dispatch(fetchProducts());
      dispatch(fetchCampaigns());
    }
  }, [dispatch,open]);

  
  /* --------------------------------------------
  FORM STATE
  -------------------------------------------- */
  const [form, setForm] = useState({
    lead_name: "",
    phone: "",
    email: "",
    company: "",
    assigned_rep_id: null,
    stage: "new",
    product_ids: [],
    campaign_ids: [],
    deal_amount: 0,
    source: "manual"
  });
  
  const [productDetails, setProductDetails] = useState<
  { product_id: number }[]
  >([]);
  
  /* --------------------------------------------
  FORM UPDATER
  -------------------------------------------- */
  const update = (key: string, value: any) => {
    if (key === "deal_amount") value = Number(value);
    
    if (key === "product_ids") {
      const updated = value.map((id: number) => {
        const match = productDetails.find((p) => p.product_id === id);
        return (
          match || {
            product_id: id,
            quantity: 1,
            price: products.find((p: any) => p.id === id)?.price || 0,
          }
        );
      });
      setProductDetails(updated);
    }
    
    setForm({ ...form, [key]: value });
  };
  
  /* --------------------------------------------
  FORM FIELDS
  -------------------------------------------- */
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

  // Assigned Representative
  {
    name: "assigned_rep_id",
    label: "Assigned Representative",
    type: "select",
    placeholder: "Select representative",
    options: members.map((m) => ({
      label: m.name,
      value: m.id,
    })),
  },

  // Stage
  {
    name: "stage",
    label: "Stage",
    type: "select",
    placeholder: "Select stage",
    options: LEAD_STAGES,
  },

  // Campaigns
  {
    name: "campaign_ids",
    label: "Campaigns",
    type: "multiselect",
    placeholder: "Select campaign(s)",
    options: campaigns.map((c: any) => ({
      label: c.name,
      value: c.id,
    })),
  },

  // Products
  {
    name: "product_ids",
    label: "Products",
    type: "multiselect",
    placeholder: "Select product(s)",
    options: products.map((p: any) => ({
      label: p.name,
      value: p.id,
    })),
  },

  {
    name: "deal_amount",
    label: "Deal Amount",
    type: "number",
    placeholder: "Enter deal value",
  },

  {
    name: "source",
    label: "Source",
    type: "select",
    placeholder: "Select source",
    options: [
      { label: "Manual", value: "manual" },
      { label: "Voice", value: "voice" },
      { label: "OCR", value: "ocr" },
      { label: "Tap Event", value: "tap" },
      { label: "CSV Import", value: "csv" },
    ],
  },
];

  
  /* --------------------------------------------
  SUBMIT HANDLER
  -------------------------------------------- */
 const handleSubmit = () => {
  const payload = {
    lead_name: form.lead_name,
    phone: form.phone,
    email: form.email,
    company: form.company,
    assigned_rep_id: Number(form.assigned_rep_id) || null,  // ensure integer
    stage: "new",

    // only integer array of product IDs
    products: form.product_ids.map(Number),

    // only integer array of campaign IDs
    campaigns: form.campaign_ids.map(Number),

    deal_amount: Number(form.deal_amount) || 0,

    source: form.source,
  };

  onSubmit(payload);
};

  
  if (!open) return null;
  /* --------------------------------------------
      COMPONENT UI
      -------------------------------------------- */
      return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4 z-50">
      <div className="bg-white w-[550px] max-h-[90vh] overflow-y-auto rounded-xl shadow-xl p-6 space-y-6">

        {/* Header */}
        <div className="flex justify-between items-center pb-3 border-b">
          <h2 className="text-xl font-semibold">Create Lead</h2>
          <button onClick={onClose}>✕</button>
        </div>

        {/* Dynamic Form */}
        <DynamicForm form={form} fields={fields} onChange={update} />

        {/* Footer */}
        <div className="pt-4 border-t flex justify-end gap-2">
          <button className="px-4 py-2" onClick={onClose}>Cancel</button>

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
