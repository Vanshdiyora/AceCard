// components/details/TeamMemberLeadsTab.tsx
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../../../../app/hooks";

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

  return (
    <div className="bg-white border rounded-xl p-5">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium">
          Leads Captured ({assignedLeads.length})
        </h3>

        <button
          className="text-sm text-purple-600"
          onClick={() =>
            navigate(`/admin/leads?assignedTo=${memberId}`)
          }
        >
          View all leads →
        </button>
      </div>

      {/* Empty State */}
      {assignedLeads.length === 0 && (
        <div className="text-sm text-gray-500 py-6 text-center">
          No leads assigned to this member
        </div>
      )}

      {/* Leads Table */}
      {assignedLeads.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-gray-500 border-b">
              <tr>
                <th className="text-left py-2">Lead</th>
                <th className="text-left py-2">Company</th>
                <th className="text-left py-2">Stage</th>
                <th className="text-left py-2">Deal</th>
                <th className="text-left py-2">Last Activity</th>
              </tr>
            </thead>

            <tbody>
              {assignedLeads.map((lead) => (
                <tr
                  key={lead.id}
                  className="border-b hover:bg-gray-50 cursor-pointer"
                  onClick={() =>
                    navigate(`/admin/leads/${lead.id}`)
                  }
                >
                  <td className="py-3 font-medium">
                    {lead.lead_name}
                  </td>
                  <td className="py-3">{lead.company}</td>
                  <td className="py-3 capitalize">
                    {lead.stage}
                  </td>
                  <td className="py-3">
                    ₹{lead.deal_amount?.toLocaleString() ?? "-"}
                  </td>
                  <td className="py-3 text-gray-500">
                    {lead.last_interaction_at
                      ? new Date(
                          lead.last_interaction_at
                        ).toLocaleDateString()
                      : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
