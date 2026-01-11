import type { Lead } from "../types";
import LeadActionsMenu from "./LeadsActionMenu";
import { useNavigate } from "react-router-dom";
export default function LeadRow({ lead, onEdit, onArchive }: {
  lead: Lead;
  onEdit: () => void;
  onArchive: () => void;
}) {
  const avatar = lead.lead_name.charAt(0).toUpperCase();
const navigate = useNavigate();
  const stageBadge: Record<string, string> = {
    new: "bg-blue-100 text-blue-700",
    qualified: "bg-orange-100 text-orange-700",
    contacted: "bg-yellow-100 text-yellow-700",
    hot: "bg-red-100 text-red-700",
    demo: "bg-indigo-100 text-indigo-700",
  };

  return (
    <tr className="border-b hover:bg-gray-50 text-sm">
      <td className="py-3 px-4 flex items-center gap-3" onClick={() => navigate(`${lead.id}`)} style={{cursor: 'pointer'}}>
        <div className="w-10 h-10 flex items-center justify-center bg-gray-200 rounded-full font-semibold">
          {avatar}
        </div>
        <div>
          <p className="font-medium">{lead.lead_name}</p>
          <p className="text-gray-500 text-xs">{lead.company}</p>
        </div>
      </td>

      
      <td className="py-3 px-4">-</td>
      <td className="py-3 px-4">-</td>
     
      <td className="py-3 px-4">
        <span className={`px-3 py-1 text-xs rounded-full ${stageBadge[lead.stage] ?? "bg-gray-100"}`}>
          {lead.stage.charAt(0).toUpperCase() + lead.stage.slice(1)}
        </span>
      </td>

      <td className="py-3 px-4 text-gray-500">
        {new Date(lead.updated_at).toLocaleDateString()}
      </td>

      <td className="py-3 px-4 text-right">
        <LeadActionsMenu onEdit={onEdit} onArchive={onArchive} />
      </td>
    </tr>
  );
}
