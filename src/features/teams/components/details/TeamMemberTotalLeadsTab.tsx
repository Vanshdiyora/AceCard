import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../../app/hooks";
import DataTable, { type Column } from "../../../../common/components/table/DataTable";
import PageFilters from "../../../../common/components/layout/PageFilter";
import { fetchLeads } from "../../../leads/slice";

type LeadRow = {
  id: number;
  lead_name: string;
  company: string;
  stage: string;
  deal_amount?: number;
  last_interaction_at?: string;
};

export default function TeamMemberTotalLeadsTab({ managerId }: { managerId: number }) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { leads, loading } = useAppSelector(s => s.leads);
  const [search, setSearch] = useState("");

  useEffect(() => {
    dispatch(fetchLeads({ page: 1, pageSize: 10, team_member_id: managerId, search }));
  }, [managerId, search, dispatch]);

  const rows: LeadRow[] = leads.map(l => ({
    id: l.id,
    lead_name: l.lead_name,
    company: l.company,
    stage: l.stage,
    deal_amount: l.deal_amount,
    last_interaction_at: l.last_interaction_at,
  }));

  const columns: Column<LeadRow>[] = [
    { header: "Lead", accessor: "lead_name" },
    { header: "Company", accessor: "company" },
    { header: "Stage", accessor: "stage", align: "center", width: "120px" },
    {
      header: "Deal",
      accessor: "deal_amount",
      align: "right",
      render: row => `₹${row.deal_amount?.toLocaleString() ?? "-"}`,
    }
  ];

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border pt-4 flex justify-between items-center">
        <div>
          <h3 className="text-base font-semibold">
            Total Leads
          </h3>
          <p className="text-sm text-gray-500">All leads under this manager</p>
        </div>
      </div>

      <PageFilters searchPlaceholder="Search leads..." onSearch={setSearch} />

      <DataTable
        columns={columns}
        data={rows}
        loading={loading}
        emptyText="No leads found"
        onRowClick={row => navigate(`/admin/leads/${row.id}`)}
      />
    </div>
  );
}
