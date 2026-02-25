import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { updateCampaign } from "../slice";
import { fetchTeam } from "../../teams/slice";
import { fetchProducts } from "../../products/slice";
import type { EnrichedCampaign } from "../types";
import DynamicForm, { type FieldConfig } from "../../../common/ui/DynamicForm";
import { validateField } from "../../../common/utils/formValidator";
import BlockingLoader from "../../../common/ui/BlockingLoader";

type Props = {
  open: boolean;
  onClose: () => void;
  campaign: EnrichedCampaign;
  onSuccess?: () => void;
  onError?: (message: string) => void;
  setProcessing?: (v: boolean) => void;
};

const STATUS_OPTIONS = [
  { label: "Planned", value: "planned" },
  { label: "Active", value: "active" },
  { label: "Paused", value: "paused" },
  { label: "Completed", value: "completed" },
  { label: "Archived", value: "archived" },
  { label: "Expired", value: "expired" },
];

export default function EditCampaignModal({
  open,
  onClose,
  campaign,
  onSuccess,
  onError,
  setProcessing,
}: Props) {
  const dispatch = useAppDispatch();

  // const { members } = useAppSelector((s) => s.team);
  const { products, loading: productsLoading } = useAppSelector(
    (s) => s.products
  );
  const loading = useAppSelector((s) => s.campaigns.loading);

  const [form, setForm] = useState<any>(null);
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  /* ---------- PAGINATION STATE ---------- */
  const [managerPage, setManagerPage] = useState(1);
  const [salesPage, setSalesPage] = useState(1);
  const [productPage, setProductPage] = useState(1);

  const [hasNextManagers, setHasNextManagers] = useState(true);
  const [hasNextSales, setHasNextSales] = useState(true);
  const [hasNextProducts, setHasNextProducts] = useState(true);

  const [loadingMoreManagers, setLoadingMoreManagers] = useState(false);
  const [loadingMoreSales, setLoadingMoreSales] = useState(false);
  const [loadingMoreProducts, setLoadingMoreProducts] = useState(false);

const { managers, salesReps: salespeople } = useAppSelector((s) => s.team); 

  /* ---------- FORM BUILDER ---------- */
  const buildForm = (c: EnrichedCampaign) => ({
    name: c.name ?? "",
    description: c.description ?? "",
    status: c.status,
    budget: c.budget ?? "",
    manager_id: c.manager_id ?? "",
    assigned_reps_ids: c.assigned_reps?.map((r) => r.id) ?? [],
    product_ids: c.products?.map((p) => p.id) ?? [],
    start_date: c.start_date?.split("T")[0] ?? "",
    end_date: c.end_date?.split("T")[0] ?? "",
  });

  /* ---------- INIT ---------- */
  useEffect(() => {
    if (!open) return;

    setForm(buildForm(campaign));
    setErrors({});
    setSubmitAttempted(false);
    setManagerPage(1);
    setSalesPage(1);
    setProductPage(1);

    setHasNextManagers(true);
    setHasNextSales(true);
    setHasNextProducts(true);

    /* Managers */
    dispatch(
      fetchTeam({ page: 1, page_size: 10, role: "manager", append: true })
    )
      .unwrap()
      .then((res: any) => setHasNextManagers(res.meta.has_next));

    /* Sales reps */
    dispatch(
      fetchTeam({ page: 1, page_size: 10, role: "sales_rep", append: true })
    )
      .unwrap()
      .then((res: any) => setHasNextSales(res.meta.has_next));

    /* Products – RESET list */
    dispatch(
      fetchProducts({
        page: 1,
        page_size: 10,
        mode: "paginate",
      })
    )
      .unwrap()
      .then((res: any) => setHasNextProducts(res.meta.has_next));
  }, [open]);

  /* ---------- BODY SCROLL LOCK ---------- */
  useEffect(() => {
    if (!open) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [open]);

  if (!open || !form) return null;

  /* ---------- FORM UPDATE ---------- */
  const update = (key: string, value: any) => {
    setForm((prev: any) => ({ ...prev, [key]: value }));
  };

  /* ---------- LOAD MORE ---------- */
  const loadMoreManagers = async () => {
    if (loadingMoreManagers || !hasNextManagers) return;

    setLoadingMoreManagers(true);
    const next = managerPage + 1;

    const res: any = await dispatch(
      fetchTeam({ page: next, page_size: 10, role: "manager", append: true })
    ).unwrap();

    setManagerPage(next);
    setHasNextManagers(res.meta.has_next);
    setLoadingMoreManagers(false);
  };

  const loadMoreSales = async () => {
    if (loadingMoreSales || !hasNextSales) return;

    setLoadingMoreSales(true);
    const next = salesPage + 1;

    const res: any = await dispatch(
      fetchTeam({ page: next, page_size: 10, role: "sales_rep", append: true })
    ).unwrap();

    setSalesPage(next);
    setHasNextSales(res.meta.has_next);
    setLoadingMoreSales(false);
  };

  const loadMoreProducts = async () => {
    if (loadingMoreProducts || !hasNextProducts) return;

    setLoadingMoreProducts(true);
    const next = productPage + 1;

    const res: any = await dispatch(
      fetchProducts({
        page: next,
        page_size: 10,
        mode: "infinite", // ✅ APPEND
      })
    ).unwrap();

    setProductPage(next);
    setHasNextProducts(res.meta.has_next);
    setLoadingMoreProducts(false);
  };

  /* ---------- FIELD CONFIG ---------- */
  const fields: FieldConfig[] = [
    {
      name: "name",
      label: "Campaign Name",
      type: "text",
      required: true,
      minLength: 3,
    },
    {
      name: "description",
      label: "Description",
      type: "textarea",
    },
    {
      name: "budget",
      label: "Budget",
      type: "number",
      required: true,
      min: 1,
    },
    {
      name: "status",
      label: "Status",
      type: "select",
      required: true,
      options: STATUS_OPTIONS,
    },
    {
      name: "manager_id",
      label: "Owner (Manager)",
      type: "search-select",   // 🔥
      required: true,
      options: managers.map((m) => ({
        label: m.name,
        value: m.id,
      })),
      onScrollEnd: loadMoreManagers,
      showLoader: loadingMoreManagers,
    },

    {
      name: "assigned_reps_ids",
      label: "Assigned Salespersons",
      type: "search-multiselect", // 🔥
      options: salespeople.map((s) => ({
        label: s.name,
        value: s.id,
      })),
      onScrollEnd: loadMoreSales,
      showLoader: loadingMoreSales,
    },

    {
      name: "product_ids",
      label: "Products",
      type: "search-multiselect", // 🔥
      required: true,
      options: products.map((p) => ({
        label: p.name,
        value: p.id,
      })),
      onScrollEnd: loadMoreProducts,
      showLoader: loadingMoreProducts || productsLoading,
      disabled: productsLoading,
      hideValues: false,
    },

    {
      name: "start_date",
      label: "Start Date",
      type: "date",
      required: true,
    },
    {
      name: "end_date",
      label: "End Date",
      type: "date",
    },
  ];

  /* ---------- SAVE ---------- */
const save = async () => {
  setSubmitAttempted(true);

  const newErrors: Record<string, string | null> = {};
  let hasErrors = false;

  fields.forEach((field) => {
    const error = validateField(field, form[field.name], form);
    newErrors[field.name] = error;
    if (error) hasErrors = true;
  });

  setErrors(newErrors);
  if (hasErrors) return;

  try {
    setProcessing?.(true);

    await dispatch(
      updateCampaign({
        id: campaign.id,
        data: {
          name: form.name,
          description: form.description || undefined,
          status: form.status,
          budget: Number(form.budget),
          manager_id: Number(form.manager_id),
          assigned_reps_ids: form.assigned_reps_ids.length
            ? form.assigned_reps_ids
            : undefined,
          product_ids: form.product_ids.length
            ? form.product_ids
            : undefined,
          start_date: form.start_date
            ? new Date(form.start_date).toISOString()
            : undefined,
          end_date: form.end_date
            ? new Date(form.end_date).toISOString()
            : undefined,
        },
      })
    ).unwrap();

    onClose();
    onSuccess?.(); // ✅ Trigger ResultModal

  } catch (err: unknown) {
    const message =
      typeof err === "string"
        ? err
        : err instanceof Error
        ? err.message
        : "Failed to update campaign.";

    onError?.(message); // ✅ Trigger error ResultModal
  } finally {
    setProcessing?.(false);
  }
};

  /* ---------- UI ---------- */
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-[520px] max-h-[90vh] rounded-xl shadow-lg flex flex-col">
        <div className="p-5 border-b">
          <h2 className="text-xl font-semibold">Edit Campaign</h2>
        </div>

        <DynamicForm
          fields={fields}
          form={form}
          onChange={update}
          errors={errors}
          setErrors={setErrors}
          submitAttempted={submitAttempted} 
        />

        <div className="p-4 border-t flex justify-end gap-3">
          <button
            className="px-4 py-2 bg-gray-200 rounded"
            onClick={onClose}
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

      <BlockingLoader show={loading} />
    </div>
  );
}
