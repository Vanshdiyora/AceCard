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

  const leads = useAppSelector((s) => s.leads?.leads ?? []);
  const leadsLoading = useAppSelector((s) => s.leads?.loading ?? false);

  const members = useAppSelector((s) => s.team?.members ?? []);
  const membersLoading = useAppSelector((s) => s.team?.loading ?? false);

  const campaigns = useAppSelector((s) => s.campaigns?.items ?? []);
  const campaignsLoading = useAppSelector((s) => s.campaigns?.loading ?? false);

  useEffect(() => {
    if (!leadsLoading && leads.length === 0) {
      dispatch(fetchLeads({ page: 1, pageSize: 10 }));
    }

    if (!membersLoading && members.length === 0) {
      dispatch(fetchTeam());
    }

    if (!campaignsLoading && campaigns.length === 0) {
      dispatch(fetchCampaigns({ page: 1, page_size: 10 }));
    }
  }, [dispatch]); // intentionally only on mount

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

      <div className="">
        <DataTable<LeadRow>
          columns={columns}
          data={rows}
          loading={leadsLoading || membersLoading || campaignsLoading}
          emptyText="No leads associated with this product."
          onRowClick={(row) => navigate(`/admin/leads/${row.id}`)}
        />
      </div>
    </div>
  );
}
