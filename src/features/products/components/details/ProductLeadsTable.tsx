import { useNavigate } from "react-router-dom";
import { useEffect, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../../../../app/hooks";

import { fetchLeads } from "../../../leads/slice";
import { fetchTeam } from "../../../teams/slice";
import { fetchCampaigns } from "../../../campaigns/slice";
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

  const { leads, loading: leadsLoading } = useAppSelector((s) => s.leads);
  const { members } = useAppSelector((s) => s.team);
  const { items: campaigns } = useAppSelector((s) => s.campaigns);

  /* ---------------- Fetch dependencies ---------------- */
  useEffect(() => {
    if (leads.length === 0) dispatch(fetchLeads({ page: 1, pageSize: 10 }));
    if (members.length === 0) dispatch(fetchTeam());
    if (campaigns.length === 0) dispatch(fetchCampaigns({ page: 1, page_size: 10 }));
  }, [dispatch, leads.length, members.length, campaigns.length]);

  /* ---------------- Enrich leads ---------------- */
  const rows: LeadRow[] = useMemo(() => {
    return leads
      .filter((l) => l.products?.includes(productId))
      .map((l) => {
        const owner = members.find((m) => m.id === l.assigned_rep_id);
        const campaign = campaigns.find((c) => c.id === l.campaign_id);
        const manager = members.find((m) => m.id === campaign?.manager_id);

        return {
          id: l.id,
          lead_name: l.lead_name,
          campaign_name: campaign?.name,
          owner_name: owner?.name,
          manager_name: manager?.name,
        };
      });
  }, [leads, members, campaigns, productId]);

  const columns: Column<LeadRow>[] = [
    {
      header: "Lead Name",
      accessor: "lead_name",
      render: (row) => (
        <span>
          {row.lead_name}
        </span>
      ),
    },
    { header: "Campaign", accessor: "campaign_name" },
    { header: "Owner", accessor: "owner_name" },
    { header: "Manager", accessor: "manager_name" },
  ];

  if (leadsLoading) {
    return (
      <div className="bg-white p-8 rounded-xl text-center text-gray-500">
        Loading leads...
      </div>
    );
  }

  return (
    <div className="rounded-2xl border">

      {/* Header */}
      <div className="py-4 border-b">
        <h3 className="text-base font-semibold">Associated Leads</h3>
      </div>

      {/* Table */}
      <div>
        <DataTable<LeadRow>
          columns={columns}
          data={rows}
          emptyText="No leads associated with this product."
          onRowClick={(row) => navigate(`/admin/leads/${row.id}`)}
        />
      </div>

    </div>
  );
}
