import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../../app/hooks";
import { lookupProducts } from "../../../products/slice";
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

  const { lookup, loading } = useAppSelector((s) => s.products);

  useEffect(() => {
    if (assignedProducts.length) {
      dispatch(lookupProducts(assignedProducts));
    }
  }, [dispatch, assignedProducts.join(",")]); // join to avoid ref change loops

  const rows: ProductRow[] = useMemo(() => {
    return lookup.map((p) => ({
      id: p.id,
      name: p.name,
      category: p.category ?? "—",
      price: p.price ?? 0,
    }));
  }, [lookup]);

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

  if (!assignedProducts.length) {
    return <div className="py-6 text-gray-500">No products assigned</div>;
  }

  if (loading) return <div className="py-6 text-gray-500">Loading…</div>;

  return (
    <div>
      <div>
        <h3 className="text-lg font-semibold">Products</h3>
        <p className="text-sm text-gray-500">Products linked to this campaign</p>
      </div>

      <div className="rounded-2xl border mt-6">
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
