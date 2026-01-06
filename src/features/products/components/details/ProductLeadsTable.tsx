import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../../../app/hooks";

import { fetchLeads } from "../../../leads/slice";
import { fetchTeam } from "../../../teams/slice";
import { fetchCampaigns } from "../../../campaigns/slice";

type Props = {
  productId: number;
};

export default function ProductLeadsTable({ productId }: Props) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { leads, loading: leadsLoading } = useAppSelector((s) => s.leads);
  const { members } = useAppSelector((s) => s.team);
  const { items: campaigns } = useAppSelector((s) => s.campaigns);

  // Load required data
  useEffect(() => {
    if (leads.length === 0) dispatch(fetchLeads({ page: 1, pageSize: 1000 }));
    if (members.length === 0) dispatch(fetchTeam());
    if (campaigns.length === 0) dispatch(fetchCampaigns());
  }, [dispatch, leads.length, members.length, campaigns.length]);

  // Filter leads by product and enrich them
  const enrichedLeads = leads
    .filter((l) => l.products?.includes(productId))
    .map((l) => {
      const owner = members.find((m) => m.id === l.assigned_rep_id);
      const campaign = campaigns.find((c) => c.id === l.campaign_id);
      const manager = members.find((m) => m.id === campaign?.manager_id);

      return {
        ...l,
        owner_name: owner?.name,
        campaign_name: campaign?.name,
        manager_name: manager?.name,
      };
    });

  if (leadsLoading) {
    return (
      <div className="bg-white p-8 rounded-xl text-center text-gray-500">
        Loading leads...
      </div>
    );
  }

  if (!enrichedLeads.length) {
    return (
      <div className="bg-white p-8 rounded-xl text-center text-gray-500">
        No leads associated with this product.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="px-6 py-4 border-b">
        <h3 className="font-semibold text-lg">Associated Leads</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-6 py-3 text-left">Lead Name</th>
              <th className="px-6 py-3 text-left">Campaign</th>
              <th className="px-6 py-3 text-left">Owner</th>
              <th className="px-6 py-3 text-left">Manager</th>
            </tr>
          </thead>

          <tbody>
            {enrichedLeads.map((l) => (
              <tr
                key={l.id}
                className="border-t hover:bg-gray-50 transition cursor-pointer"
                onClick={() => navigate(`/admin/leads/${l.id}`)}
              >
                <td className="px-6 py-4 font-medium text-purple-600">
                  {l.lead_name}
                </td>
                <td className="px-6 py-4">
                  {l.campaign_name || "—"}
                </td>
                <td className="px-6 py-4">
                  {l.owner_name || "—"}
                </td>
                <td className="px-6 py-4">
                  {l.manager_name || "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
