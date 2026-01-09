import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../../../app/hooks";
import { fetchProducts } from "../slice";
import { ProductsAPI } from "../services/products.service";
import ProductFormModal from "../components/ProductFormModal";
import PageHeader from "../../../common/components/layout/PageHeader";
import PageFilters from "../../../common/components/layout/PageFilter";
import DataTable, { type Column } from "../../../common/components/table/DataTable";
// import TableLoader from "../../../common/ui/TableLoader";
import { Edit2 } from "lucide-react";

type SortBy = "recent" | "name" | "price";
type StatusFilter = "all" | "active" | "archived";

export default function ProductsPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { products: rawProducts = [], loading } = useAppSelector(
    s => s.products ?? {}
  );

  const products = Array.isArray(rawProducts) ? rawProducts : [];

  const [open, setOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<any | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortBy, setSortBy] = useState<SortBy>("recent");

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const filtered = useMemo(() => {
    let list = [...products];

    if (statusFilter !== "all") {
      list = list.filter(p => p.status === statusFilter);
    }

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        p =>
          p.name.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q)
      );
    }

    if (sortBy === "name") {
      list.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "price") {
      list.sort((a, b) => a.price - b.price);
    } else {
      list.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    }

    return list;
  }, [products, statusFilter, sortBy, search]);

  const handleExport = () => {
    const rows = filtered.map(p => ({
      Name: p.name,
      Description: p.description || "",
      Price: p.price,
      Category: p.category || "",
      Status: p.status,
    }));

    if (!rows.length) return;

    const csv = [
      Object.keys(rows[0]).join(","),
      ...rows.map(r => Object.values(r).join(",")),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "products.csv";
    a.click();
  };

  const handleImport = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".csv";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      const text = await file.text();
      const [header, ...lines] = text.split("\n");
      const keys = header.split(",");

      for (const line of lines) {
        if (!line.trim()) continue;
        const values = line.split(",");
        const row: any = {};
        keys.forEach((k, i) => (row[k.trim()] = values[i]?.trim()));

        await ProductsAPI.createProduct({
          name: row.Name,
          description: row.Description,
          price: Number(row.Price),
          category: row.Category,
        });
      }

      dispatch(fetchProducts());
    };
    input.click();
  };

  const columns: Column<any>[] = [
    { header: "Name", accessor: "name" },
    { header: "Category", accessor: "category" },
    {
      header: "Price",
      render: p => `₹${p.price}`,
    },
    {
      header: "Status",
      render: p => (
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
      render: p => (
        <button
          onClick={e => {
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
  onExport={handleExport}
  onImport={handleImport}
/>


      {/* {loading && (
        <div className="bg-white rounded-xl border p-6">
          <TableLoader />
        </div>
      )} */}

      {/* {!loading && ( */}
        <div className="mt-6" >
        <DataTable
        columns={columns}
        data={filtered}
        emptyText={loading ? "Loading..." : "No products found"}
        onRowClick={p => navigate(`/admin/products/${p.id}`)}
        />
        </div>
      {/* )} */}

      <ProductFormModal
        open={open}
        product={editProduct}
        onClose={() => {
          setOpen(false);
          setEditProduct(null);
        }}
        onSubmit={async data => {
          if (editProduct) {
            await ProductsAPI.updateProduct(editProduct.id, data);
          } else {
            await ProductsAPI.createProduct(data);
          }
          dispatch(fetchProducts());
          setOpen(false);
          setEditProduct(null);
        }}
      />
    </div>
  );
}
