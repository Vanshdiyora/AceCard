import { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { createCampaign } from "../slice";
import { fetchTeam } from "../../teams/slice";
import { fetchProducts } from "../../products/slice";
import type { CampaignStatus } from "../types";
import DynamicForm, { type FieldConfig } from "../../../common/ui/DynamicForm";
import { validateField } from "../../../common/utils/formValidator";
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
  budget: "",
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

  const { members, loading: teamLoading } = useAppSelector((s) => s.team);
  const { products, loading: productsLoading } = useAppSelector(
    (s) => s.products
  );

  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [processing, setProcessing] = useState(false);

  const [resultOpen, setResultOpen] = useState(false);
  const [resultSuccess, setResultSuccess] = useState(true);
  const [resultMessage, setResultMessage] = useState("");

  /* ---------- PAGINATION STATE ---------- */
  const [productPage, setProductPage] = useState(1);
  const [managerPage, setManagerPage] = useState(1);
  const [salesPage, setSalesPage] = useState(1);

  const [hasNextProducts, setHasNextProducts] = useState(true);
  const [hasNextManagers, setHasNextManagers] = useState(true);
  const [hasNextSales, setHasNextSales] = useState(true);

  const [loadingMoreProducts, setLoadingMoreProducts] = useState(false);
  const [loadingMoreManagers, setLoadingMoreManagers] = useState(false);
  const [loadingMoreSales, setLoadingMoreSales] = useState(false);

  /* ---------- INIT ---------- */
  useEffect(() => {
    if (!open) return;

    setForm(EMPTY_FORM);
    setErrors({});

    setProductPage(1);
    setManagerPage(1);
    setSalesPage(1);

    setHasNextProducts(true);
    setHasNextManagers(true);
    setHasNextSales(true);

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

    /* Products (RESET LIST) */
    dispatch(
      fetchProducts({
        page: 1,
        page_size: 10,
        mode: "paginate",
      })
    )
      .unwrap()
      .then((res: any) => setHasNextProducts(res.meta.has_next));
  }, [dispatch, open]);

  /* ---------- BODY SCROLL LOCK ---------- */
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

  const managers = useMemo(
    () => members.filter((m) => m.role === "manager"),
    [members]
  );

  const salespeople = useMemo(
    () => members.filter((m) => m.role === "sales_rep"),
    [members]
  );

  /* ---------- FORM UPDATE ---------- */
  const update = (key: string, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  /* ---------- LOAD MORE ---------- */
  const loadMoreProducts = async () => {
    if (loadingMoreProducts || !hasNextProducts) return;

    setLoadingMoreProducts(true);
    const next = productPage + 1;

    const res: any = await dispatch(
      fetchProducts({
        page: next,
        page_size: 10,
        mode: "infinite",
      })
    ).unwrap();

    setProductPage(next);
    setHasNextProducts(res.meta.has_next);
    setLoadingMoreProducts(false);
  };

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
      label: "Campaign Description",
      type: "textarea",
    },
    {
      name: "budget",
      label: "Target / Budget",
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
      name: "owner_id",
      label: "Owner (Manager)",
      type: "select",
      required: true,
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
      required: true,
      minItems: 1,
      options: products.map((p) => ({ label: p.name, value: p.id })),
      disabled: productsLoading,
      onScrollEnd: loadMoreProducts,
      showLoader: loadingMoreProducts || productsLoading,
    },
    {
      name: "start_date",
      label: "Start Date",
      type: "date",
      required: true,
    },
    {
      name: "end_date",
      label: "End Date (Optional)",
      type: "date",
    },
  ];

  /* ---------- SUBMIT ---------- */
  const handleSubmit = async () => {
    const hasErrors = fields.some((field) => {
      const error = validateField(
        field,
        form[field.name as keyof typeof form],
        form
      );
      setErrors((prev) => ({ ...prev, [field.name]: error }));
      return error;
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
          end_date: form.end_date
            ? new Date(form.end_date).toISOString()
            : undefined,
          status: form.status,
          budget: Number(form.budget),
        } as any)
      ).unwrap();

      setResultSuccess(true);
      setResultMessage("Campaign created successfully.");
      setResultOpen(true);
    } catch {
      setResultSuccess(false);
      setResultMessage("Failed to create campaign.");
      setResultOpen(true);
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

          <DynamicForm
            fields={fields}
            form={form}
            onChange={update}
            errors={errors}
            setErrors={setErrors}
          />

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
