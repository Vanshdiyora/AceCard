import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../../app/hooks";
import { fetchProductLeads } from "../../../products/slice";
import DataTable, { type Column } from "../../../../common/components/table/DataTable";

type Props = {
  productId: number;
};

type LeadRow = {
  id: number;
  lead_name: string;
  campaign_name?: string;
  owner_name?: string;
  manager_name?: string;
};

export default function ProductLeadsTable({ productId }: Props) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const leads = useAppSelector((s) => s.products.productLeads);
  const loading = useAppSelector((s) => s.products.productLeadsLoading);

  useEffect(() => {
    dispatch(fetchProductLeads(productId));
  }, [dispatch, productId]);

  const columns: Column<LeadRow>[] = [
    { header: "Lead Name", accessor: "lead_name" },
    { header: "Campaign", accessor: "campaign_name" },
    { header: "Owner", accessor: "owner_name" },
    { header: "Manager", accessor: "manager_name" },
  ];

  return (
    <div className="rounded-2xl border">
      <div className="py-4 border-b">
        <h3 className="text-base font-semibold">Associated Leads</h3>
      </div>

      <DataTable<LeadRow>
        columns={columns}
        data={leads}
        loading={loading}
        emptyText="No leads associated with this product."
        onRowClick={(row) => navigate(`/admin/leads/${row.id}`)}
      />
    </div>
  );
}
