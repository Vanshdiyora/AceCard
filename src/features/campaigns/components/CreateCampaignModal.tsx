import { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { createCampaign } from "../slice";
import { fetchTeam } from "../../teams/slice";
import { fetchProducts } from "../../products/slice";
import type { CampaignStatus } from "../types";
import DynamicForm, { type FieldConfig } from "../../../common/ui/DynamicForm";
import BlockingLoader from "../../../common/ui/BlockingLoader";
import ResultModal from "../../../common/ui/ResultModal";

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

const EMPTY_FORM = {
  name: "",
  description: "",
  budget: 0,
  status: "planned" as CampaignStatus,
  owner_id: "",
  salesperson_ids: [] as number[],
  product_ids: [] as number[],
  start_date: "",
  end_date: "",
};

export default function CreateCampaignModal({
  open,
  onClose,
}: CreateCampaignModalProps) {
  const dispatch = useAppDispatch();

  const { members } = useAppSelector((s) => s.team);
  const { products } = useAppSelector((s) => s.products);

  const [form, setForm] = useState(EMPTY_FORM);
  const [processing, setProcessing] = useState(false);

  const [resultOpen, setResultOpen] = useState(false);
  const [resultSuccess, setResultSuccess] = useState(true);
  const [resultMessage, setResultMessage] = useState("");

  const showResult = (success: boolean, message: string) => {
    setResultSuccess(success);
    setResultMessage(message);
    setResultOpen(true);
  };

  useEffect(() => {
    if (open) {
      dispatch(fetchTeam());
      dispatch(fetchProducts({ page: 1, page_size: 10 }));
      setForm(EMPTY_FORM);
    }
  }, [dispatch, open]);

  /* -------- Lock background scroll -------- */
  useEffect(() => {
    if (!open) return;

    const scrollY = window.scrollY;
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";

    return () => {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      window.scrollTo(0, scrollY);
    };
  }, [open]);

  const managers = useMemo(
    () => members.filter((m) => m.role === "manager"),
    [members]
  );

  const salespeople = useMemo(
    () => members.filter((m) => m.role === "sales_rep"),
    [members]
  );

  if (!open) return null;

  const update = (key: string, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const fields: FieldConfig[] = [
    { name: "name", label: "Campaign Name", type: "text", placeholder: "Enter campaign name" },
    { name: "description", label: "Campaign Description", type: "textarea", placeholder: "Describe the campaign" },
    { name: "budget", label: "Target / Budget", type: "number", placeholder: "Enter target budget" },
    { name: "status", label: "Status", type: "select", options: STATUS_OPTIONS },
    {
      name: "owner_id",
      label: "Owner (Manager)",
      type: "select",
      options: managers.map((m) => ({ label: m.name, value: m.id })),
    },
    {
      name: "salesperson_ids",
      label: "Assigned Salespersons",
      type: "multiselect",
      placeholder: "Select salespeople",
      options: salespeople.map((s) => ({ label: s.name, value: s.id })),
    },
    {
      name: "product_ids",
      label: "Products",
      type: "multiselect",
      placeholder: "Select products",
      options: products.map((p) => ({ label: p.name, value: p.id })),
    },
    { name: "start_date", label: "Start Date", type: "date" },
    { name: "end_date", label: "End Date (Optional)", type: "date" },
  ];

  const handleSubmit = async () => {
    try {
      setProcessing(true);

      const payload = {
        name: form.name,
        description: form.description || undefined,
        manager_id: form.owner_id ? Number(form.owner_id) : undefined,
        assigned_reps: form.salesperson_ids.length ? form.salesperson_ids : undefined,
        products: form.product_ids.length ? form.product_ids : undefined,
        start_date: form.start_date ? new Date(form.start_date).toISOString() : undefined,
        end_date: form.end_date ? new Date(form.end_date).toISOString() : undefined,
        status: form.status,
        budget: form.budget ? Number(form.budget) : undefined,
        targets: {},
      };

      await dispatch(createCampaign(payload as any)).unwrap();

      showResult(true, "Campaign created successfully.");
    } catch {
      showResult(false, "Failed to create campaign.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="bg-white w-[520px] max-h-[90vh] rounded-xl shadow-lg flex flex-col">

          <div className="p-5 border-b">
            <h2 className="text-xl font-semibold">Create Campaign</h2>
          </div>

          <DynamicForm fields={fields} form={form} onChange={update} />

          <div className="p-4 border-t flex justify-end gap-3">
            <button
              className="px-4 py-2 bg-gray-200 rounded"
              onClick={onClose}
              disabled={processing}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 bg-purple-600 text-white rounded disabled:opacity-50"
              onClick={handleSubmit}
              disabled={processing}
            >
              Create
            </button>
          </div>
        </div>
      </div>

      <BlockingLoader show={processing} />

      <ResultModal
        open={resultOpen}
        success={resultSuccess}
        message={resultMessage}
        onClose={() => {
          setResultOpen(false);
          if (resultSuccess) onClose();
        }}
      />
    </>
  );
}
