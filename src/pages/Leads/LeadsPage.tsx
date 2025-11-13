import { useState } from "react";
import { Search, Filter, MoreVertical } from "lucide-react";

export default function LeadsPage() {
  const [search, setSearch] = useState("");

  const leads = [
    {
      id: 1,
      name: "John Smith",
      company: "Tech Solutions Inc.",
      stage: "Qualified",
      stageColor: "bg-green-100 text-green-700",
      owner: "Sarah J.",
      lastContact: "2 hours ago",
      nextAction: "Follow-up call",
    },
    {
      id: 2,
      name: "Emily Davis",
      company: "Global Enterprises",
      stage: "Contacted",
      stageColor: "bg-yellow-100 text-yellow-700",
      owner: "Michael C.",
      lastContact: "1 day ago",
      nextAction: "Send proposal",
    },
    {
      id: 3,
      name: "Robert Wilson",
      company: "Innovation Labs",
      stage: "New",
      stageColor: "bg-blue-100 text-blue-700",
      owner: "David R.",
      lastContact: "3 days ago",
      nextAction: "Initial outreach",
    },
    {
      id: 4,
      name: "Lisa Anderson",
      company: "Future Tech Corp",
      stage: "Qualified",
      stageColor: "bg-green-100 text-green-700",
      owner: "Sarah J.",
      lastContact: "5 hours ago",
      nextAction: "Schedule demo",
    },
    {
      id: 5,
      name: "James Brown",
      company: "Digital Dynamics",
      stage: "Negotiation",
      stageColor: "bg-purple-100 text-purple-700",
      owner: "Michael C.",
      lastContact: "30 mins ago",
      nextAction: "Contract review",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Page Title */}
      <div>
        <h2 className="text-2xl font-semibold">Leads</h2>
        <p className="text-gray-500">Manage and track your leads</p>
      </div>

      {/* Filters Row */}
      <div className="flex items-center gap-3">
        {/* Search Input */}
        <div className="relative w-80">
          <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search leads..."
            className="w-full border rounded-lg py-2.5 pl-10 pr-4 text-sm"
          />
        </div>

        {/* Stage Filter */}
        <button className="border rounded-lg px-4 py-2 flex items-center justify-between text-sm bg-white">
          All Stages
          <span className="ml-2">▼</span>
        </button>

        {/* More Filters */}
        <button className="border rounded-lg px-4 py-2 flex items-center gap-2 text-sm bg-white">
          <Filter size={16} />
          More Filters
        </button>

        {/* Add Lead */}
        <button className="ml-auto bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-lg text-sm flex items-center gap-2">
          + Add Lead
        </button>
      </div>

      {/* Leads Table */}
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
            {leads.map((lead) => (
              <tr key={lead.id} className="border-b hover:bg-gray-50 text-sm">
                <td className="py-3 px-4">{lead.name}</td>

                <td className="py-3 px-4">{lead.company}</td>

                <td className="py-3 px-4">
                  <span
                    className={`px-3 py-1 text-xs rounded-full ${lead.stageColor}`}
                  >
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
          </tbody>
        </table>
      </div>
    </div>
  );
}
