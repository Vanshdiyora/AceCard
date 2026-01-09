import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../../app/hooks";
import { fetchProducts } from "../../../products/slice";
import DataTable, { type Column } from "../../../../common/components/table/DataTable";

type Props = {
  assignedProducts?: number[];
};

type ProductRow = {
  id: number;
  name: string;
  category: string;
  price: number;
};

export default function CampaignProductsTab({ assignedProducts = [] }: Props) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { products, loading } = useAppSelector((s) => s.products);

  useEffect(() => {
    if (!products.length) dispatch(fetchProducts({ page: 1, page_size: 10 }));
  }, [dispatch, products.length]);

  const rows: ProductRow[] = useMemo(() => {
    return products
      .filter((p) => assignedProducts.includes(p.id))
      .map((p) => ({
        id: p.id,
        name: p.name,
        category: p.category ?? "—",
        price: p.price ?? 0,
      }));
  }, [products, assignedProducts]);

  const columns: Column<ProductRow>[] = [
    { header: "Name", accessor: "name" },
    { header: "Category", accessor: "category" },
    {
      header: "Price",
      accessor: "price",
      align: "right",
      render: (row) => `₹${row.price.toLocaleString()}`,
    },
  ];

  if (loading) return <div className="py-6 text-gray-500">Loading…</div>;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Products</h3>
        <p className="text-sm text-gray-500">
          Products linked to this campaign
        </p>
      </div>

      <div className="rounded-2xl border">
        <DataTable<ProductRow>
          columns={columns}
          data={rows}
          emptyText="No products assigned to this campaign"
          onRowClick={(row) => navigate(`/admin/products/${row.id}`)}
        />
      </div>
    </div>
  );
}
