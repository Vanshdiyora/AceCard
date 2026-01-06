import { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { createCampaign, fetchCampaigns } from "../slice";
import { fetchTeam } from "../../teams/slice";
import { fetchProducts } from "../../products/slice";
import type { CampaignStatus } from "../types";
import DynamicForm, { type FieldConfig } from "../../../common/ui/DynamicForm";

interface CreateCampaignModalProps {
  open: boolean;
  onClose: () => void;
}

const STATUS_OPTIONS = [
  { label: "Yet to Begin", value: "planned" },
  { label: "Ongoing", value: "active" },
  { label: "Completed", value: "completed" },
  { label: "Archived", value: "archived" },
];

export default function CreateCampaignModal({
  open,
  onClose,
}: CreateCampaignModalProps) {
  const dispatch = useAppDispatch();

  const { members } = useAppSelector((s) => s.team);
  const { products } = useAppSelector((s) => s.products);

  useEffect(() => {
    dispatch(fetchTeam());
    dispatch(fetchProducts());
  }, [dispatch]);

  const managers = useMemo(
    () => members.filter((m) => m.role === "manager"),
    [members]
  );

  const salespeople = useMemo(
    () => members.filter((m) => m.role === "sales_rep"),
    [members]
  );

  const [form, setForm] = useState({
    name: "",
    description: "",
    budget: 0,
    status: "planned" as CampaignStatus,
    owner_id: "",
    salesperson_ids: [] as number[],
    product_ids: [] as number[],
    start_date: "",
    end_date: "",
  });

  if (!open) return null;

  const update = (key: string, value: any) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const fields: FieldConfig[] = [
    {
      name: "name",
      label: "Campaign Name",
      type: "text",
      placeholder: "Enter campaign name",
    },
    {
      name: "description",
      label: "Campaign Description",
      type: "textarea",
      placeholder: "Describe the campaign",
    },
    {
      name: "budget",
      label: "Target / Budget",
      type: "number",
      placeholder: "Enter target budget",
    },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: STATUS_OPTIONS,
    },
    {
      name: "owner_id",
      label: "Owner (Manager)",
      type: "select",
      options: managers.map((m) => ({
        label: m.name,
        value: m.id,
      })),
    },
    {
      name: "salesperson_ids",
      label: "Assigned Salespersons",
      type: "multiselect",
      placeholder: "Select salespeople",
      options: salespeople.map((s) => ({
        label: s.name,
        value: s.id,
      })),
    },
    {
      name: "product_ids",
      label: "Products",
      type: "multiselect",
      placeholder: "Select products",
      options: products.map((p) => ({
        label: p.name,
        value: p.id,
      })),
    },
    {
      name: "start_date",
      label: "Start Date",
      type: "date",
    },
    {
      name: "end_date",
      label: "End Date (Optional)",
      type: "date",
    },
  ];

const handleSubmit = async () => {
  const managerId =
    form.owner_id !== "" ? Number(form.owner_id) : undefined;

  const payload = {
    name: form.name,
    description: form.description || undefined,
    manager_id: managerId,
    assigned_reps: form.salesperson_ids.length
      ? form.salesperson_ids
      : undefined,
    products: form.product_ids.length
      ? form.product_ids
      : undefined,
    start_date: form.start_date
      ? new Date(form.start_date).toISOString()
      : undefined,
    end_date: form.end_date
      ? new Date(form.end_date).toISOString()
      : undefined,
    status: form.status,
    budget: form.budget ? Number(form.budget) : undefined,
    targets: {}, // or remove if unused
  };

  await dispatch(createCampaign(payload as any));
  await dispatch(fetchCampaigns());
  onClose();
};


  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-[520px] max-h-[90vh] rounded-xl shadow-lg flex flex-col">

        <div className="p-5 border-b">
          <h2 className="text-xl font-semibold">Create Campaign</h2>
        </div>

        <DynamicForm fields={fields} form={form} onChange={update} />

        <div className="p-4 border-t flex justify-end gap-3">
          <button className="px-4 py-2 bg-gray-200 rounded" onClick={onClose}>
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-purple-600 text-white rounded"
            onClick={handleSubmit}
          >
            Create
          </button>
        </div>

      </div>
    </div>
  );
}
