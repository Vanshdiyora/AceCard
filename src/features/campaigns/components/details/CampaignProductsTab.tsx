import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import DataTable, { type Column } from "../../../../common/components/table/DataTable";
import type { CampaignProduct } from "../../types";

type Props = {
  assignedProducts?: CampaignProduct[];
};

type ProductRow = {
  id: number;
  name: string;
  category: string;
  price: number;
};

export default function CampaignProductsTab({ assignedProducts = [] }: Props) {
  const navigate = useNavigate();

  const rows: ProductRow[] = useMemo(() => {
    return assignedProducts.map((p) => ({
      id: p.id,
      name: p.name,
      category: p.category ?? "—",
      price: p.price ?? 0,
    }));
  }, [assignedProducts]);

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

  return (
    <div>
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
