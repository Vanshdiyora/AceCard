import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../../../../app/hooks";
import DataTable, { type Column } from "../../../../common/components/table/DataTable";

type LeadRow = {
  id: number;
  lead_name: string;
  company: string;
  stage: string;
  deal_amount?: number;
  last_interaction_at?: string;
};

export default function TeamMemberLeadsTab({
  memberId,
}: {
  memberId: number;
}) {
  const navigate = useNavigate();
  const { leads } = useAppSelector((s) => s.leads);

  const assignedLeads = leads.filter(
    (l) => l.assigned_rep_id === memberId && !l.archived
  );

  const rows: LeadRow[] = assignedLeads.map((l) => ({
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
      width: "140px",
      render: (row) => `₹${row.deal_amount?.toLocaleString() ?? "-"}`,
    },
    {
      header: "Last Activity",
      accessor: "last_interaction_at",
      width: "160px",
      align: "right",
      render: (row) =>
        row.last_interaction_at
          ? new Date(row.last_interaction_at).toLocaleDateString()
          : "-",
    },
  ];

  return (
    <div className="space-y-4 mt-6">

      {/* Header (white only here) */}
      <div className=" rounded-2xl border flex justify-between items-center">
        <div>
          <h3 className="text-base font-semibold">
            Leads Captured
            <span className="ml-2 text-sm text-gray-400">
              ({rows.length})
            </span>
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

      {/* Table (no background wrapper) */}
      <DataTable<LeadRow>
        columns={columns}
        data={rows}
        emptyText="No leads assigned to this member"
        onRowClick={(row) => navigate(`/admin/leads/${row.id}`)}
      />

    </div>
  );
}
