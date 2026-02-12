import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../../../app/hooks";
import { fetchProducts, createProduct, updateProduct, bulkImportProducts } from "../slice";
import ProductFormModal from "../components/ProductFormModal";
import ProductImportModal from "../components/ProductImportModal";
import PageHeader from "../../../common/components/layout/PageHeader";
import PageFilters from "../../../common/components/layout/PageFilter";
import DataTable, { type Column } from "../../../common/components/table/DataTable";
import ErrorAlert from "../../../common/ui/ErrorAlert";
import { Edit2 } from "lucide-react";
import type { Product } from "../types";
import BlockingLoader from "../../../common/ui/BlockingLoader";
import ResultModal from "../../../common/ui/ResultModal";
import { downloadCSV } from "../../../common/components/helper/DownloadCsv";
import { ProductsAPI } from "../services/products.service";
import { AvatarCell } from "../../../common/components/table/DataTable";
type SortBy = "recent" | "name" | "deal_amount";
type SortOrder = "asc" | "desc";

type StatusFilter = "all" | "active" | "archived";

export default function ProductsPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { products: rawProducts = [], loading, meta, error } = useAppSelector(
    (s) => s.products ?? {}
  );

  const products: Product[] = Array.isArray(rawProducts) ? rawProducts : [];

  const [open, setOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [importOpen, setImportOpen] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortBy, setSortBy] = useState<SortBy>("recent");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  const [page, setPage] = useState(1);
  const pageSize = meta?.page_size ?? 10;
  const [searchParams, setSearchParams] = useSearchParams();

  const [blocking, setBlocking] = useState(false);
  const [result, setResult] = useState({
    open: false,
    success: true,
    message: "",
  });

  /* -------- Fetch products -------- */
  useEffect(() => {
    const params: any = {
      page,
      page_size: pageSize,
      mode: "paginate",

      // 👇 SORT PARAMS
      sort_by: sortBy,
      sort_order: sortOrder,
    };

    if (search) params.search = search;
    if (statusFilter !== "all") params.status = statusFilter;

    dispatch(fetchProducts(params));
  }, [dispatch, page, pageSize, search, statusFilter, sortBy, sortOrder]);


  /* -------- Reset page -------- */
  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, sortBy]);

  const lockScroll = () => {
    const scrollBarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    document.body.style.paddingRight = `${scrollBarWidth}px`;
  };

  const unlockScroll = () => {
    document.documentElement.style.overflow = "";
    document.body.style.overflow = "";
    document.body.style.paddingRight = "";
  };
  useEffect(() => {
    const isAnyModalOpen = importOpen || result.open;

    if (isAnyModalOpen) {
      lockScroll();
    } else {
      unlockScroll();
    }

    return () => {
      unlockScroll();
    };
  }, [importOpen, result.open]);
  useEffect(() => {
    const open = searchParams.get("open");

    if (open === "import") {
      setImportOpen(true);
    }
  }, [searchParams]);

  /* -------- Export -------- */
  const handleExport = async () => {
    try {
      const totalCount = meta?.total_count ?? 0;
      if (!totalCount) return;

      const params: any = { page: 1, page_size: totalCount };
      if (search) params.search = search;
      if (statusFilter !== "all") params.status = statusFilter;

      const result = await ProductsAPI.getAll(params);

      const csvData = result.data.map((p: Product) => ({
        Name: p.name,
        Category: p.category,
        Price: p.price,
        Status: p.status,
        Description: p.description ?? "",
      }));

      downloadCSV(csvData, "products_export.csv");
    } catch (err) {
      console.error("Export failed", err);
    }
  };

  /* -------- Import -------- */
  const handleImport = async (file: File) => {
    try {
      setBlocking(true);

      const res = await dispatch(bulkImportProducts(file)).unwrap();

      setResult({
        open: true,
        success: res.status === "success",
        message:
          res.status === "success"
            ? `${res.count} products imported successfully`
            : "Product import failed",
      });

      setImportOpen(false);
      searchParams.delete("open");
      setSearchParams(searchParams, { replace: true });

      dispatch(fetchProducts({ page: 1, page_size: pageSize }));
    } catch (err: any) {
      setResult({
        open: true,
        success: false,
        message: err ?? "Import failed",
      });
    } finally {
      setBlocking(false);
    }
  };


  /* -------- Final data -------- */
  const finalProducts = products;

  /* -------- Columns -------- */
  const columns: Column<Product>[] = [
    {
      header: "",
      width: "56px",
      render: AvatarCell, // 👈 FIRST COLUMN
    },
    { header: "Name", accessor: "name" },
    { header: "Category", accessor: "category" },
    { header: "Price", render: (p) => `₹${p.price}` },
    {
      header: "Status",
      render: (p) => (
        <span
          className={`px-2 py-1 rounded text-xs ${p.status === "active"
            ? "bg-green-100 text-green-700"
            : "bg-gray-200 text-gray-600"
            }`}
        >
          {p.status}
        </span>
      ),
    },
    {
      header: "Actions",
      align: "right",
      render: (p) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setEditProduct(p);
            setOpen(true);
          }}
          className="text-purple-600 text-sm flex items-center gap-1 hover:underline"
        >
          <Edit2 size={14} /> Edit
        </button>
      ),
    },
  ];

  return (
    <div className="p-6">
      <BlockingLoader show={blocking} />

      <ResultModal
        open={result.open}
        success={result.success}
        message={result.message}
        onClose={() => setResult({ ...result, open: false })}
      />

      <PageHeader
        title="Products"
        description="Manage your product catalog"
        addButtonLabel="Add Product"
        onAdd={() => {
          setEditProduct(null);
          setOpen(true);
        }}
      />

      {error && <ErrorAlert message={error} />}

      <PageFilters
        tabs={[
          { label: "All", value: "all" },
          { label: "Active", value: "active" },
          { label: "Archived", value: "archived" },
        ]}
        activeTab={statusFilter}
        onTabChange={(v) => setStatusFilter(v as StatusFilter)}
        searchPlaceholder="Search products..."
        onSearch={setSearch}
        filters={[
          {
            title: "SORT BY",
            key: "sort_by",
            placeholder: "Sort by",
            value: sortBy,
            onChange: (v) => setSortBy(v as SortBy),
            options: [
              { label: "Recent", value: "recent" },
              { label: "Name", value: "name" },
              { label: "Price", value: "deal_amount" },
            ],
          },
          {
            title: "ORDER",
            key: "sort_order",
            placeholder: "Order",
            value: sortOrder,
            onChange: (v) => setSortOrder(v as SortOrder),
            options: [
              { label: "Ascending", value: "asc" },
              { label: "Descending", value: "desc" },
            ],
          },
        ]}
        onExport={handleExport}
        onImport={() => setImportOpen(true)}
        disableExport={finalProducts.length === 0}
      />


      <div className="mt-6">
        <DataTable
          columns={columns}
          data={finalProducts}
          loading={loading}
          page={meta?.page ?? page}
          totalPages={meta?.total_pages ?? 1}
          onPageChange={setPage}
          emptyText="No products found"
          onRowClick={(p) =>
            navigate(`/admin/products/${p.id}`, { state: { product: p } })
          }
        />
      </div>

      <ProductFormModal
        open={open}
        product={editProduct}
        onClose={() => {
          setOpen(false);
          setEditProduct(null);
        }}
        onSubmit={async (data) => {
          try {
            setBlocking(true);
            editProduct
              ? await dispatch(updateProduct({ id: editProduct.id, data })).unwrap()
              : await dispatch(createProduct(data)).unwrap();

            setResult({
              open: true,
              success: true,
              message: editProduct
                ? "Product updated successfully"
                : "Product created successfully",
            });

            setOpen(false);
            setEditProduct(null);
          } catch (err: any) {
            setResult({
              open: true,
              success: false,
              message: err?.message ?? "Something went wrong",
            });
          } finally {
            setBlocking(false);
          }
        }}
      />

      <ProductImportModal
        open={importOpen}
        onClose={() => {
          setImportOpen(false);
          searchParams.delete("open");
          setSearchParams(searchParams, { replace: true });
        }}
        onImport={handleImport}
      />

    </div>
  );
}
