import { useNavigate } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../../../../app/hooks";
import DataTable, { type Column } from "../../../../common/components/table/DataTable";
import PageFilters from "../../../../common/components/layout/PageFilter";
import { useEffect, useState } from "react";
import { fetchLeads } from "../../../leads/slice";

type LeadRow = {
  id: number;
  lead_name: string;
  company: string;
  stage: string;
  deal_amount?: number;
  last_interaction_at?: string;
};

export default function TeamMemberLeadsTab({ memberId }: { memberId: number }) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { leads, loading } = useAppSelector((s) => s.leads);

  const [search, setSearch] = useState("");

  useEffect(() => {
    dispatch(fetchLeads({ page: 1, pageSize: 50, memberId, search }));
  }, [memberId, search, dispatch]);

  const rows: LeadRow[] = leads
    .filter((l) => !l.archived)
    .map((l) => ({
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
      render: (row) => `₹${row.deal_amount?.toLocaleString() ?? "-"}`,
    },
    {
      header: "Last Activity",
      accessor: "last_interaction_at",
      align: "right",
      render: (row) =>
        row.last_interaction_at
          ? new Date(row.last_interaction_at).toLocaleDateString()
          : "-",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border pt-4 flex justify-between items-center">
        <div>
          <h3 className="text-base font-semibold">
            Leads Captured{" "}
            <span className="ml-2 text-sm text-gray-400">({rows.length})</span>
          </h3>
          <p className="text-sm text-gray-500">
            Leads currently assigned to this member
          </p>
        </div>

        <button
          className="text-sm text-purple-600 hover:underline"
          onClick={() => navigate(`/admin/leads?assignedTo=${memberId}`)}
        >
          View all →
        </button>
      </div>

      <PageFilters
        searchPlaceholder="Search leads..."
        onSearch={setSearch}
      />

      <DataTable<LeadRow>
        columns={columns}
        data={rows}
        loading={loading}
        emptyText="No leads assigned to this member"
        onRowClick={(row) => navigate(`/admin/leads/${row.id}`)}
      />
    </div>
  );
}
