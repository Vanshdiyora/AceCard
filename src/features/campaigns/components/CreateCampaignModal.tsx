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

export default function CreateCampaignModal({ open, onClose }: CreateCampaignModalProps) {
  const dispatch = useAppDispatch();

  const { members, loading: teamLoading } = useAppSelector((s) => s.team);
  const { products, meta, loading: productsLoading } = useAppSelector((s) => s.products);

  const [form, setForm] = useState(EMPTY_FORM);
  const [processing, setProcessing] = useState(false);

  const [resultOpen, setResultOpen] = useState(false);
  const [resultSuccess, setResultSuccess] = useState(true);
  const [resultMessage, setResultMessage] = useState("");

  const [productPage, setProductPage] = useState(1);
  const [managerPage, setManagerPage] = useState(1);
  const [salesPage, setSalesPage] = useState(1);

  const [hasNextManagers, setHasNextManagers] = useState(true);
  const [hasNextSales, setHasNextSales] = useState(true);

  const [loadingMoreProducts, setLoadingMoreProducts] = useState(false);
  const [loadingMoreManagers, setLoadingMoreManagers] = useState(false);
  const [loadingMoreSales, setLoadingMoreSales] = useState(false);

  const showResult = (success: boolean, message: string) => {
    setResultSuccess(success);
    setResultMessage(message);
    setResultOpen(true);
  };

  useEffect(() => {
    if (open) {
      setForm(EMPTY_FORM);
      setProductPage(1);
      setManagerPage(1);
      setSalesPage(1);
      setHasNextManagers(true);
      setHasNextSales(true);

      dispatch(fetchTeam({ page: 1, page_size: 10, role: "manager", append: true }))
        .unwrap()
        .then((res: any) => setHasNextManagers(res.meta.has_next));

      dispatch(fetchTeam({ page: 1, page_size: 10, role: "sales_rep", append: true }))
        .unwrap()
        .then((res: any) => setHasNextSales(res.meta.has_next));

      dispatch(fetchProducts({ page: 1, page_size: 10 }));
    }
  }, [dispatch, open]);

  useEffect(() => {
    if (!open) return;
    const scrollY = window.scrollY;
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    return () => {
      document.body.style.position = "";
      document.body.style.top = "";
      window.scrollTo(0, scrollY);
    };
  }, [open]);

  const managers = useMemo(() => members.filter((m) => m.role === "manager"), [members]);
  const salespeople = useMemo(() => members.filter((m) => m.role === "sales_rep"), [members]);

  const update = (key: string, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const loadMoreProducts = async () => {
    if (loadingMoreProducts || !meta?.has_next) return;
    setLoadingMoreProducts(true);
    const next = productPage + 1;
    await dispatch(fetchProducts({ page: next, page_size: 10 }));
    setProductPage(next);
    setLoadingMoreProducts(false);
  };

  const loadMoreManagers = async () => {
    if (loadingMoreManagers || !hasNextManagers) return;
    setLoadingMoreManagers(true);
    const next = managerPage + 1;
    const res: any = await dispatch(fetchTeam({ page: next, page_size: 10, role: "manager", append: true })).unwrap();
    setManagerPage(next);
    setHasNextManagers(res.meta.has_next);
    setLoadingMoreManagers(false);
  };

  const loadMoreSales = async () => {
    if (loadingMoreSales || !hasNextSales) return;
    setLoadingMoreSales(true);
    const next = salesPage + 1;
    const res: any = await dispatch(fetchTeam({ page: next, page_size: 10, role: "sales_rep", append: true })).unwrap();
    setSalesPage(next);
    setHasNextSales(res.meta.has_next);
    setLoadingMoreSales(false);
  };

  const fields: FieldConfig[] = [
    { name: "name", label: "Campaign Name", type: "text", placeholder: "Enter campaign name", disabled: teamLoading },
    { name: "description", label: "Campaign Description", type: "textarea" },
    { name: "budget", label: "Target / Budget", type: "number" },
    { name: "status", label: "Status", type: "select", options: STATUS_OPTIONS },

    {
      name: "owner_id",
      label: "Owner (Manager)",
      type: "select",
      options: managers.map((m) => ({ label: m.name, value: m.id })),
      disabled: teamLoading,
      onScrollEnd: loadMoreManagers,
      showLoader: loadingMoreManagers,
    },
    {
      name: "salesperson_ids",
      label: "Assigned Salespersons",
      type: "multiselect",
      options: salespeople.map((s) => ({ label: s.name, value: s.id })),
      disabled: teamLoading,
      onScrollEnd: loadMoreSales,
      showLoader: loadingMoreSales,
    },
    {
      name: "product_ids",
      label: "Products",
      type: "multiselect",
      options: products.map((p) => ({ label: p.name, value: p.id })),
      onScrollEnd: loadMoreProducts,
      showLoader: loadingMoreProducts || productsLoading,
      disabled: productsLoading,
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
        assigned_reps_ids: form.salesperson_ids.length ? form.salesperson_ids : undefined,
        product_ids: form.product_ids.length ? form.product_ids : undefined,
        start_date: form.start_date ? new Date(form.start_date).toISOString() : undefined,
        end_date: form.end_date ? new Date(form.end_date).toISOString() : undefined,
        status: form.status,
        budget: form.budget ? Number(form.budget) : undefined,
      };

      await dispatch(createCampaign(payload as any)).unwrap();
      showResult(true, "Campaign created successfully.");
    } catch {
      showResult(false, "Failed to create campaign.");
    } finally {
      setProcessing(false);
    }
  };

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="bg-white w-[520px] max-h-[90vh] rounded-xl shadow-lg flex flex-col">
          <div className="p-5 border-b">
            <h2 className="text-xl font-semibold">Create Campaign</h2>
          </div>

          <DynamicForm fields={fields} form={form} onChange={update} />

          <div className="p-4 border-t flex justify-end gap-3">
            <button className="px-4 py-2 bg-gray-200 rounded" onClick={onClose} disabled={processing}>
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
