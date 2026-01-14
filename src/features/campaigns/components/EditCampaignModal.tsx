import { useState, useMemo, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { updateCampaign } from "../slice";
import type { EnrichedCampaign } from "../types";
import DynamicForm, { type FieldConfig } from "../../../common/ui/DynamicForm";

type Props = {
  open: boolean;
  onClose: () => void;
  campaign: EnrichedCampaign;
};

const STATUS_OPTIONS = [
  { label: "Planned", value: "planned" },
  { label: "Active", value: "active" },
  { label: "Paused", value: "paused" },
  { label: "Completed", value: "completed" },
  { label: "Archived", value: "archived" },
  { label: "Expired", value: "expired" },
];

export default function EditCampaignModal({ open, onClose, campaign }: Props) {
  const dispatch = useAppDispatch();
  const { members } = useAppSelector((s) => s.team);
  const { products } = useAppSelector((s) => s.products);

  const managers = useMemo(
    () => members.filter((m) => m.role === "manager"),
    [members]
  );

  const buildForm = (c: EnrichedCampaign) => ({
    name: c.name,
    description: c.description,
    status: c.status,
    budget: c.budget,
    manager_id: c.manager_id?.toString() ?? "",
    products: c.products ?? [],
    start_date: c.start_date?.split("T")[0] ?? "",
    end_date: c.end_date?.split("T")[0] ?? "",
  });

  const [form, setForm] = useState(() => buildForm(campaign));

  useEffect(() => {
    if (open) {
      setForm(buildForm(campaign));
    }
  }, [campaign, open]);

  // 🔒 Disable background scroll when modal is open
  useEffect(() => {
    if (open) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";

      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [open]);

  if (!open) return null;

  const update = (key: string, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const fields: FieldConfig[] = [
    { name: "name", label: "Campaign Name", type: "text" },
    { name: "description", label: "Description", type: "textarea" },
    { name: "budget", label: "Budget", type: "number" },
    { name: "status", label: "Status", type: "select", options: STATUS_OPTIONS },
    {
      name: "manager_id",
      label: "Owner (Manager)",
      type: "select",
      options: managers.map((m) => ({ label: m.name, value: m.id })),
    },
    {
      name: "products",
      label: "Products",
      type: "multiselect",
      options: products.map((p) => ({ label: p.name, value: p.id })),
    },
    { name: "start_date", label: "Start Date", type: "date" },
    { name: "end_date", label: "End Date", type: "date" },
  ];

  const save = async () => {
    const payload = {
      name: form.name,
      description: form.description || undefined,
      status: form.status,
      budget: Number(form.budget),
      manager_id: form.manager_id ? Number(form.manager_id) : undefined,
      products: form.products.length ? form.products : undefined,
      assigned_reps: campaign.assigned_reps ?? [],
      start_date: form.start_date
        ? new Date(form.start_date).toISOString()
        : undefined,
      end_date: form.end_date
        ? new Date(form.end_date).toISOString()
        : undefined,
    };

    await dispatch(updateCampaign({ id: campaign.id, data: payload }));
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-[520px] max-h-[90vh] rounded-xl shadow-lg flex flex-col">
        <div className="p-5 border-b">
          <h2 className="text-xl font-semibold">Edit Campaign</h2>
        </div>

        <DynamicForm fields={fields} form={form} onChange={update} />

        <div className="p-4 border-t flex justify-end gap-3">
          <button className="px-4 py-2 bg-gray-200 rounded" onClick={onClose}>
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-purple-600 text-white rounded"
            onClick={save}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
