import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../../../app/hooks";

import { fetchTeam } from "../../../teams/slice";
import { fetchLeads } from "../../../leads/slice";

type Props = {
  campaignId: number;
};

type Row = {
  salespersonId: number;
  name: string;
  totalLeads: number;
  totalDealAmount: number;
};

export default function CampaignSalespersonsTab({ campaignId }: Props) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { members, loading: teamLoading } = useAppSelector(
    (s) => s.team
  );
  const { leads, loading: leadsLoading } = useAppSelector(
    (s) => s.leads
  );

  // ✅ FETCH DATA ON DIRECT ENTRY / REFRESH
  useEffect(() => {
    if (members.length === 0) {
      dispatch(fetchTeam());
    }

    if (leads.length === 0) {
      dispatch(fetchLeads({ page: 1, pageSize:100 }));
    }
  }, [dispatch, members.length, leads.length]);

  // ✅ Correct role
  const salespersons = members.filter(
    (m) =>
      m.role === "sales_rep" && m.status === "active"
  );

  // ✅ Campaign-specific leads
//   const campaignLeads = leads.filter(
//     (l) => l.campaign_id === campaignId
//   );
  const campaignLeads = leads;
  // ✅ Aggregate per salesperson
  const rows: Row[] = salespersons
    .map((sp) => {
      const spLeads = campaignLeads.filter(
        (l) => l.assigned_rep_id === sp.id
      );

      const totalDealAmount = spLeads.reduce(
        (sum, l) => sum + (l.deal_amount ?? 0),
        0
      );

      return {
        salespersonId: sp.id,
        name: sp.name,
        totalLeads: spLeads.length,
        totalDealAmount,
      };
    })
    .filter((r) => r.totalLeads > 0);

  if (teamLoading || leadsLoading) {
    return (
      <div className="py-6 text-gray-500">
        Loading salesperson data…
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="py-6 text-gray-500 text-center">
        No salesperson activity for this campaign
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border">
        <thead className="bg-gray-50 text-left">
          <tr>
            <th className="p-3">Salesperson</th>
            <th className="p-3">Total Leads</th>
            <th className="p-3">Total Deal Amount</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((row) => (
            <tr
              key={row.salespersonId}
              onClick={() =>
                navigate(
                  `/admin/team/${row.salespersonId}`
                )
              }
              className="cursor-pointer hover:bg-gray-50 border-t"
            >
              <td className="p-3 font-medium">{row.name}</td>
              <td className="p-3">{row.totalLeads}</td>
              <td className="p-3">
                ₹{row.totalDealAmount.toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
