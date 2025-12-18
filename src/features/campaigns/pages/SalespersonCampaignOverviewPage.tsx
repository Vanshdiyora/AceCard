import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAppSelector } from "../../../app/hooks";

export default function SalespersonCampaignOverviewPage() {
  const { campaignId, salespersonId } = useParams();
  const navigate = useNavigate();

  const salesperson = useAppSelector((s) =>
    s.team.members.find(
      (m) => m.id === Number(salespersonId)
    )
  );

  const leads = useAppSelector((s) =>
    s.leads.leads.filter(
      (l) =>
        // l.campaign_id === Number(campaignId) &&
        l.assigned_rep_id === Number(salespersonId)
    )
  );

  if (!salesperson) {
    return <div className="p-6">Salesperson not found</div>;
  }

  const totalDeal = leads.reduce(
    (sum, l) => sum + (l.deal_amount ?? 0),
    0
  );

  return (
    <div className="p-6 space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-gray-500"
      >
        <ArrowLeft size={16} />
        Back
      </button>

      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold">
          {salesperson.name}
        </h2>
        <p className="text-gray-500">
          Campaign Contribution Overview
        </p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-4">
        <Metric label="Total Leads" value={leads.length} />
        <Metric
          label="Total Deal Amount"
          value={`$${totalDeal}`}
        />
      </div>

      {/* Leads Table */}
      <div>
        <h3 className="font-medium mb-2">Leads Captured</h3>

        <table className="w-full text-sm border">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left">Lead</th>
              <th className="p-3">Stage</th>
              <th className="p-3">Deal Amount</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((l) => (
              <tr
                key={l.id}
                onClick={() => navigate(`/admin/leads/${l.id}`)}
                className="cursor-pointer hover:bg-gray-50 border-t"
              >
                <td className="p-3">{l.lead_name}</td>
                <td className="p-3">{l.stage}</td>
                <td className="p-3">${l.deal_amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="border rounded p-4">
      <div className="text-gray-500 text-sm">{label}</div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
  );
}
