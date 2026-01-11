import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../../../app/hooks";
import { fetchProducts } from "../slice";
import { ProductsAPI } from "../services/products.service";
import ProductFormModal from "../components/ProductFormModal";
import PageHeader from "../../../common/components/layout/PageHeader";
import PageFilters from "../../../common/components/layout/PageFilter";
import DataTable, { type Column } from "../../../common/components/table/DataTable";
import ErrorAlert from "../../../common/ui/ErrorAlert";
import { Edit2 } from "lucide-react";
import type { Product } from "../types";

type SortBy = "recent" | "name" | "price";
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

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortBy, setSortBy] = useState<SortBy>("recent");

  const [page, setPage] = useState(1);
  const pageSize = meta?.page_size ?? 10;

  useEffect(() => {
    dispatch(fetchProducts({ page, page_size: pageSize }));
  }, [dispatch, page, pageSize]);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, sortBy]);

  const filtered = useMemo(() => {
    let list = [...products];

    if (statusFilter !== "all") list = list.filter((p) => p.status === statusFilter);

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q)
      );
    }

    switch (sortBy) {
      case "name":
        list.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "price":
        list.sort((a, b) => a.price - b.price);
        break;
      default:
        list.sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
    }

    return list;
  }, [products, statusFilter, sortBy, search]);

  const columns: Column<Product>[] = [
    { header: "Name", accessor: "name" },
    { header: "Category", accessor: "category" },
    { header: "Price", render: (p) => `₹${p.price}` },
    {
      header: "Status",
      render: (p) => (
        <span
          className={`px-2 py-1 rounded text-xs ${
            p.status === "active"
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
            key: "sort",
            placeholder: "Sort by",
            value: sortBy,
            onChange: (v) => setSortBy(v as SortBy),
            options: [
              { label: "Recent", value: "recent" },
              { label: "Name A–Z", value: "name" },
              { label: "Price", value: "price" },
            ],
          },
        ]}
      />

      <div className="mt-6">
        <DataTable
          columns={columns}
          data={filtered}
          loading={loading}
          page={meta?.page ?? page}
          totalPages={meta?.total_pages ?? 1}
          onPageChange={setPage}
          emptyText="No products found"
          onRowClick={(p) => navigate(`/admin/products/${p.id}`, { state: { product: p } })}
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
          if (editProduct) await ProductsAPI.updateProduct(editProduct.id, data);
          else await ProductsAPI.createProduct(data);

          dispatch(fetchProducts({ page, page_size: pageSize }));
          setOpen(false);
          setEditProduct(null);
        }}
      />
    </div>
  );
}
