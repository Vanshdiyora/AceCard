import { useState, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../../../../app/hooks";
import { updateCampaign } from "../../slice";
import type { EnrichedCampaign } from "../../types";
import type { Campaign } from "../../types";
import DynamicForm, { type FieldConfig } from "../../../../common/ui/DynamicForm";

type Props = {
  campaign: EnrichedCampaign;
};

const STATUS_OPTIONS = [
  { label: "Planned", value: "planned" },
  { label: "Active", value: "active" },
  { label: "Paused", value: "paused" },
  { label: "Completed", value: "completed" },
  { label: "Archived", value: "archived" },
];

export default function CampaignOverviewTab({ campaign }: Props) {
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

  const [openEdit, setOpenEdit] = useState(false);
  const [form, setForm] = useState(() => buildForm(campaign));

  const update = (key: string, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const fields: FieldConfig[] = [
    { name: "name", label: "Campaign Name", type: "text" },
    { name: "description", label: "Description", type: "textarea" },
    { name: "budget", label: "Budget", type: "number" },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: STATUS_OPTIONS,
    },
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
    const payload: Partial<Campaign> = {
      name: form.name,
      description: form.description,
      status: form.status,
      budget: Number(form.budget),
      manager_id: form.manager_id ? Number(form.manager_id) : undefined,
      products: form.products,
      start_date: form.start_date || undefined,
      end_date: form.end_date || undefined,
    };

    await dispatch(updateCampaign({ id: campaign.id, data: payload }));
    setOpenEdit(false);
  };

  return (
    <>
      {/* READ VIEW */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm relative">

        <Field label="Campaign Name" value={campaign.name} />
        <StatusField status={campaign.status} />
        <Field label="Budget / Target" value={`$${campaign.budget}K`} />
        <Field label="Owner (Manager)" value={campaign.owner_name ?? "—"} />
        <Field label="Start Date" value={campaign.start_date?.split("T")[0] ?? "—"} />
        <Field label="End Date" value={campaign.end_date?.split("T")[0] ?? "—"} />

        <div className="md:col-span-2">
          <Field label="Description" value={campaign.description} />
        </div>
      </div>

      {/* EDIT MODAL */}
      {openEdit && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-[520px] max-h-[90vh] rounded-xl shadow-lg flex flex-col">

            <div className="p-5 border-b">
              <h2 className="text-xl font-semibold">Edit Campaign</h2>
            </div>

            <DynamicForm fields={fields} form={form} onChange={update} />

            <div className="p-4 border-t flex justify-end gap-3">
              <button
                className="px-4 py-2 bg-gray-200 rounded"
                onClick={() => setOpenEdit(false)}
              >
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
      )}
    </>
  );
}

/* ---------- Helpers ---------- */

function Field({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <div className="text-gray-500">{label}</div>
      <div className="font-medium break-words">{value || "—"}</div>
    </div>
  );
}

function StatusField({ status }: { status: Campaign["status"] }) {
  const colorMap: Record<string, string> = {
    planned: "bg-blue-100 text-blue-700",
    active: "bg-green-100 text-green-700",
    paused: "bg-yellow-100 text-yellow-700",
    archived: "bg-gray-200 text-gray-700",
    completed: "bg-purple-100 text-purple-700",
  };

  return (
    <div>
      <div className="text-gray-500">Status</div>
      <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-medium ${colorMap[status]}`}>
        {status}
      </span>
    </div>
  );
}
