import { useState } from "react";
import { useAppSelector } from "../../app/hooks";
import { Search, Filter, MoreVertical } from "lucide-react";

export default function LeadsPage() {
  const [search, setSearch] = useState("");

  // ⬅️ Get leads from Redux store
  const leads = useAppSelector((state) => state.leads.leads);

  const filteredLeads = leads.filter((lead) =>
    lead.name.toLowerCase().includes(search.toLowerCase()) ||
    lead.company.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Leads</h2>
        <p className="text-gray-500">Manage and track your leads</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative w-80">
          <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search leads..."
            className="w-full border rounded-lg py-2.5 pl-10 pr-4 text-sm"
          />
        </div>

        <button className="border rounded-lg px-4 py-2 text-sm bg-white">
          All Stages ▼
        </button>

        <button className="border rounded-lg px-4 py-2 flex items-center gap-2 text-sm bg-white">
          <Filter size={16} />
          More Filters
        </button>

        <button className="ml-auto bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-lg text-sm">
          + Add Lead
        </button>
      </div>

      <div className="bg-white rounded-xl border shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-gray-50 text-left text-sm text-gray-600">
              <th className="py-3 px-4">Name</th>
              <th className="py-3 px-4">Company</th>
              <th className="py-3 px-4">Stage</th>
              <th className="py-3 px-4">Owner</th>
              <th className="py-3 px-4">Last Contact</th>
              <th className="py-3 px-4">Next Action</th>
              <th className="py-3 px-4"></th>
            </tr>
          </thead>

          <tbody>
            {filteredLeads.map((lead) => (
              <tr key={lead.id} className="border-b hover:bg-gray-50 text-sm">
                <td className="py-3 px-4">{lead.name}</td>
                <td className="py-3 px-4">{lead.company}</td>

                <td className="py-3 px-4">
                  <span className={`px-3 py-1 text-xs rounded-full ${lead.stageColor}`}>
                    {lead.stage}
                  </span>
                </td>

                <td className="py-3 px-4">{lead.owner}</td>
                <td className="py-3 px-4">{lead.lastContact}</td>
                <td className="py-3 px-4">{lead.nextAction}</td>

                <td className="py-3 px-4 text-right">
                  <MoreVertical size={16} className="cursor-pointer text-gray-600" />
                </td>
              </tr>
            ))}

            {filteredLeads.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-6 text-gray-500">
                  No leads found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
