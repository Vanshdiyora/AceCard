import { useState, useMemo, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { updateCampaign } from "../slice";
import { fetchTeam } from "../../teams/slice";
import { fetchProducts } from "../../products/slice";
import type { EnrichedCampaign } from "../types";
import DynamicForm, { type FieldConfig } from "../../../common/ui/DynamicForm";
import BlockingLoader from "../../../common/ui/BlockingLoader";

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
  const { products, meta, loading: productsLoading } = useAppSelector((s) => s.products);
  const loading = useAppSelector((s) => s.campaigns.loading);

  const [managerPage, setManagerPage] = useState(1);
  const [salesPage, setSalesPage] = useState(1);
  const [productPage, setProductPage] = useState(1);

  const [hasNextManagers, setHasNextManagers] = useState(true);
  const [hasNextSales, setHasNextSales] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);

  const [loadingMoreManagers, setLoadingMoreManagers] = useState(false);
  const [loadingMoreSales, setLoadingMoreSales] = useState(false);
  const [loadingMoreProducts, setLoadingMoreProducts] = useState(false);

  const managers = useMemo(() => members.filter((m) => m.role === "manager"), [members]);
  const salespeople = useMemo(() => members.filter((m) => m.role === "sales_rep"), [members]);

  const buildForm = (c: EnrichedCampaign) => ({
    name: c.name,
    description: c.description,
    status: c.status,
    budget: c.budget,
    manager_id: c.manager_id?.toString() ?? "",
    salesperson_ids: c.assigned_reps?.map((r) => r.id) ?? [],
    products: c.products?.map((p) => p.id) ?? [],
    start_date: c.start_date?.split("T")[0] ?? "",
    end_date: c.end_date?.split("T")[0] ?? "",
  });

  const [form, setForm] = useState(() => buildForm(campaign));

  useEffect(() => {
    if (!open) {
      setHasLoaded(false);
      return;
    }

    if (hasLoaded) return;
    setHasLoaded(true);

    setForm(buildForm(campaign));
    setManagerPage(1);
    setSalesPage(1);
    setProductPage(1);
    setHasNextManagers(true);
    setHasNextSales(true);

    dispatch(fetchTeam({ page: 1, page_size: 10, role: "manager", append: true }))
      .unwrap()
      .then((res: any) => setHasNextManagers(res.meta.has_next));

    dispatch(fetchTeam({ page: 1, page_size: 10, role: "sales_rep", append: true }))
      .unwrap()
      .then((res: any) => setHasNextSales(res.meta.has_next));

    dispatch(fetchProducts({ page: 1, page_size: 10 }));
  }, [open, dispatch, hasLoaded, campaign]);

  useEffect(() => {
    if (open) setForm(buildForm(campaign));
  }, [campaign, open]);

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

  const loadMoreProducts = async () => {
    if (loadingMoreProducts || !meta?.has_next) return;
    setLoadingMoreProducts(true);
    const next = productPage + 1;
    await dispatch(fetchProducts({ page: next, page_size: 10 }));
    setProductPage(next);
    setLoadingMoreProducts(false);
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
      onScrollEnd: loadMoreManagers,
      showLoader: loadingMoreManagers,
    },
    {
      name: "salesperson_ids",
      label: "Assigned Salespersons",
      type: "multiselect",
      options: salespeople.map((s) => ({ label: s.name, value: s.id })),
      onScrollEnd: loadMoreSales,
      showLoader: loadingMoreSales,
    },
    {
      name: "products",
      label: "Products",
      type: "multiselect",
      options: products.map((p) => ({ label: p.name, value: p.id })),
      onScrollEnd: loadMoreProducts,
      showLoader: loadingMoreProducts || productsLoading,
      disabled: productsLoading,
    },
    { name: "start_date", label: "Start Date", type: "date" },
    { name: "end_date", label: "End Date", type: "date" },
  ];

  const save = async () => {
    try {
      const payload = {
        name: form.name,
        description: form.description || undefined,
        status: form.status,
        budget: Number(form.budget),
        manager_id: form.manager_id ? Number(form.manager_id) : undefined,
        assigned_rep_ids: form.salesperson_ids.length ? form.salesperson_ids : undefined,
        product_ids: form.products.length ? form.products : undefined,
        start_date: form.start_date ? new Date(form.start_date).toISOString() : undefined,
        end_date: form.end_date ? new Date(form.end_date).toISOString() : undefined,
      };

      await dispatch(updateCampaign({ id: campaign.id, data: payload })).unwrap();
      onClose();
    } catch (err) {
      console.error("Failed to update campaign", err);
    }
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
          <button className="px-4 py-2 bg-purple-600 text-white rounded" onClick={save}>
            Save Changes
          </button>
        </div>
      </div>

      <BlockingLoader show={loading} />
    </div>
  );
}
