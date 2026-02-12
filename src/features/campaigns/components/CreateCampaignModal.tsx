import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { createCampaign } from "../slice";
import { fetchTeam } from "../../teams/slice";
import { fetchProducts } from "../../products/slice";
import type { CampaignStatus } from "../types";
import DynamicForm, { type FieldConfig } from "../../../common/ui/DynamicForm";
import { validateField } from "../../../common/utils/formValidator";
import BlockingLoader from "../../../common/ui/BlockingLoader";
import ResultModal from "../../../common/ui/ResultModal";

/* ======================================================
   CONSTANTS
====================================================== */

interface CreateCampaignModalProps {
  open: boolean;
  onClose: () => void;
}

const STATUS_OPTIONS = [
  { label: "Planned", value: "planned" },
  { label: "Draft", value: "draft" },
  { label: "Active", value: "active" },
  { label: "Paused", value: "paused" },
  { label: "Archived", value: "archived" },
  { label: "Completed", value: "completed" },
  { label: "Expired", value: "expired" },
];

const EMPTY_FORM = {
  name: "",
  description: "",
  budget: "",
  status: "planned" as CampaignStatus,
  owner_id: "",
  salesperson_ids: [] as number[],
  product_ids: [] as number[],
  start_date: "",
  end_date: "",
};

/* ======================================================
   COMPONENT
====================================================== */

export default function CreateCampaignModal({
  open,
  onClose,
}: CreateCampaignModalProps) {
  const dispatch = useAppDispatch();

  const { managers, salesReps } = useAppSelector((s) => s.team);
  const { products, loading: productsLoading } = useAppSelector(
    (s) => s.products
  );

  /* ---------- FORM ---------- */
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [processing, setProcessing] = useState(false);

  const [resultOpen, setResultOpen] = useState(false);
  const [resultSuccess, setResultSuccess] = useState(true);
  const [resultMessage, setResultMessage] = useState("");

  /* ---------- SEARCH ---------- */
  const [managerSearch, setManagerSearch] = useState("");
  const [salesSearch, setSalesSearch] = useState("");
  const [productSearch, setProductSearch] = useState("");

  /* ---------- PAGINATION ---------- */
  const [managerPage, setManagerPage] = useState(1);
  const [salesPage, setSalesPage] = useState(1);
  const [productPage, setProductPage] = useState(1);

  const [hasNextManagers, setHasNextManagers] = useState(true);
  const [hasNextSales, setHasNextSales] = useState(true);
  const [hasNextProducts, setHasNextProducts] = useState(true);

  const [loadingMoreManagers, setLoadingMoreManagers] = useState(false);
  const [loadingMoreSales, setLoadingMoreSales] = useState(false);
  const [loadingMoreProducts, setLoadingMoreProducts] = useState(false);

  /* ======================================================
     🔒 OPTION A — LOCAL PERSISTENT CACHE (THE REAL FIX)
  ====================================================== */

  const [managerOptionsCache, setManagerOptionsCache] = useState<
    { label: string; value: number }[]
  >([]);

  const [salesOptionsCache, setSalesOptionsCache] = useState<
    { label: string; value: number }[]
  >([]);

  const [productOptionsCache, setProductOptionsCache] = useState<
    { label: string; value: number }[]
  >([]);

  /* ---------- MERGE REDUX → CACHE (NEVER REMOVE) ---------- */

  useEffect(() => {
    setManagerOptionsCache((prev) => {
      const map = new Map(prev.map(o => [o.value, o]));
      managers.forEach(m =>
        map.set(m.id, { label: m.name, value: m.id })
      );
      return Array.from(map.values());
    });
  }, [managers]);

  useEffect(() => {
    setSalesOptionsCache((prev) => {
      const map = new Map(prev.map(o => [o.value, o]));
      salesReps.forEach(s =>
        map.set(s.id, { label: s.name, value: s.id })
      );
      return Array.from(map.values());
    });
  }, [salesReps]);

  useEffect(() => {
    setProductOptionsCache((prev) => {
      const map = new Map(prev.map(o => [o.value, o]));
      products.forEach(p =>
        map.set(p.id, { label: p.name, value: p.id })
      );
      return Array.from(map.values());
    });
  }, [products]);

  /* ======================================================
     INIT
  ====================================================== */

  useEffect(() => {
    if (!open) return;

    setForm(EMPTY_FORM);
    setErrors({});
    setManagerSearch("");
    setSalesSearch("");
    setProductSearch("");

    setManagerPage(1);
    setSalesPage(1);
    setProductPage(1);

    dispatch(fetchTeam({ page: 1, page_size: 10, role: "manager" }))
      .unwrap()
      .then((r: any) => setHasNextManagers(r.meta.has_next));

    dispatch(fetchTeam({ page: 1, page_size: 10, role: "sales_rep" }))
      .unwrap()
      .then((r: any) => setHasNextSales(r.meta.has_next));

    dispatch(fetchProducts({ page: 1, page_size: 10, mode: "paginate" }))
      .unwrap()
      .then((r: any) => setHasNextProducts(r.meta.has_next));
  }, [open, dispatch]);

  /* ======================================================
     SEARCH (DEBOUNCED)
  ====================================================== */

  useEffect(() => {
    if (!managerSearch.trim()) return;
    const t = setTimeout(() => {
      setManagerPage(1);
      dispatch(fetchTeam({ page: 1, page_size: 10, role: "manager", search: managerSearch }));
    }, 400);
    return () => clearTimeout(t);
  }, [managerSearch, dispatch]);

  useEffect(() => {
    if (!salesSearch.trim()) return;
    const t = setTimeout(() => {
      setSalesPage(1);
      dispatch(fetchTeam({ page: 1, page_size: 10, role: "sales_rep", search: salesSearch }));
    }, 400);
    return () => clearTimeout(t);
  }, [salesSearch, dispatch]);

  useEffect(() => {
    if (!productSearch.trim()) return;
    const t = setTimeout(() => {
      setProductPage(1);
      dispatch(fetchProducts({ page: 1, page_size: 10, search: productSearch, mode: "paginate" }));
    }, 400);
    return () => clearTimeout(t);
  }, [productSearch, dispatch]);

  /* ======================================================
     LOAD MORE
  ====================================================== */

  const loadMoreManagers = async () => {
    if (!hasNextManagers || loadingMoreManagers) return;
    setLoadingMoreManagers(true);

    const r: any = await dispatch(
      fetchTeam({
        page: managerPage + 1,
        page_size: 10,
        role: "manager",
        search: managerSearch || undefined,
        append: true,
      })
    ).unwrap();

    setManagerPage(p => p + 1);
    setHasNextManagers(r.meta.has_next);
    setLoadingMoreManagers(false);
  };

  const loadMoreSales = async () => {
    if (!hasNextSales || loadingMoreSales) return;
    setLoadingMoreSales(true);

    const r: any = await dispatch(
      fetchTeam({
        page: salesPage + 1,
        page_size: 10,
        role: "sales_rep",
        search: salesSearch || undefined,
        append: true,
      })
    ).unwrap();

    setSalesPage(p => p + 1);
    setHasNextSales(r.meta.has_next);
    setLoadingMoreSales(false);
  };

  const loadMoreProducts = async () => {
    if (!hasNextProducts || loadingMoreProducts) return;
    setLoadingMoreProducts(true);

    const r: any = await dispatch(
      fetchProducts({
        page: productPage + 1,
        page_size: 10,
        search: productSearch || undefined,
        mode: "infinite",
      })
    ).unwrap();

    setProductPage(p => p + 1);
    setHasNextProducts(r.meta.has_next);
    setLoadingMoreProducts(false);
  };

  /* ======================================================
     FIELD CONFIG
  ====================================================== */

  const fields: FieldConfig[] = [
    {
      name: "name",
      label: "Campaign Name",
      type: "text",
      required: true,
      placeholder: "Enter campaign name",
    },
    {
      name: "description",
      label: "Campaign Description",
      type: "textarea",
      placeholder: "Describe the campaign (optional)",
    },
    {
      name: "budget",
      label: "Target / Budget",
      type: "number",
      required: true,
      placeholder: "Enter budget amount",
    },
    {
      name: "status",
      label: "Status",
      type: "select",
      required: true,
      placeholder: "Select status",
      options: STATUS_OPTIONS,
    },
    {
      name: "owner_id",
      label: "Owner (Manager)",
      type: "search-select",
      hideValues: false,
      required: true,
      placeholder: "Search and select manager",
      options: managerOptionsCache,
      onSearch: setManagerSearch,
      onScrollEnd: loadMoreManagers,
      showLoader: loadingMoreManagers,
    },
    {
      name: "salesperson_ids",
      label: "Assigned Salespersons",
      type: "search-multiselect",
      placeholder: "Search and select salespersons",
      options: salesOptionsCache,
      onSearch: setSalesSearch,
      onScrollEnd: loadMoreSales,
      showLoader: loadingMoreSales,
    },
    {
      name: "product_ids",
      label: "Products",
      type: "search-multiselect",
      required: true,
      hideValues: false,
      minItems: 1,
      placeholder: "Search and select products",
      options: productOptionsCache,
      onSearch: setProductSearch,
      onScrollEnd: loadMoreProducts,
      showLoader: loadingMoreProducts || productsLoading,
    },
    {
      name: "start_date",
      label: "Start Date",
      type: "date",
      required: true,
      placeholder: "Select start date",
    },
    {
      name: "end_date",
      label: "End Date (Optional)",
      type: "date",
      placeholder: "Select end date (optional)",
    },
  ];


  /* ======================================================
     SUBMIT
  ====================================================== */

  const handleSubmit = async () => {
    const hasErrors = fields.some((f) => {
      const key = f.name as keyof typeof form;
      const e = validateField(f, form[key], form);
      setErrors((p) => ({ ...p, [key]: e }));
      return !!e;
    });

    if (hasErrors) return;

    try {
      setProcessing(true);
      await dispatch(
        createCampaign({
          name: form.name,
          description: form.description || undefined,
          manager_id: Number(form.owner_id),
          assigned_reps_ids: form.salesperson_ids,
          product_ids: form.product_ids,
          start_date: new Date(form.start_date).toISOString(),
          end_date: form.end_date ? new Date(form.end_date).toISOString() : undefined,
          status: form.status,
          budget: Number(form.budget),
        } as any)
      ).unwrap();

      setResultSuccess(true);
      setResultMessage("Campaign created successfully.");
    } catch {
      setResultSuccess(false);
      setResultMessage("Failed to create campaign.");
    } finally {
      setProcessing(false);
      setResultOpen(true);
    }
  };

  const update = (key: string, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="bg-white w-[520px] max-h-[90vh] rounded-xl shadow-lg flex flex-col">
          <div className="p-5 border-b">
            <h2 className="text-xl font-semibold">Create Campaign</h2>
          </div>

          <DynamicForm
            fields={fields}
            form={form}
            onChange={update}
            errors={errors}
            setErrors={setErrors}
          />

          <div className="p-4 border-t flex justify-end gap-3">
            <button className="px-4 py-2 bg-gray-200 rounded" onClick={onClose}>
              Cancel
            </button>
            <button
              className="px-4 py-2 bg-purple-600 text-white rounded"
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
