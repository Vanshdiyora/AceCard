import { useState } from "react";
import { useAppSelector } from "../../../../app/hooks";
import { MoreVertical, Plus } from "lucide-react";

export default function TeamPage() {
    const [activeTab, setActiveTab] = useState("roster");
    const members = useAppSelector((state) => state.team.members);

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-semibold">Team</h2>
                    <p className="text-gray-500">Manage your team members and performance</p>
                </div>

                <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                    <Plus size={18} />
                    Add Member
                </button>
            </div>

            {/* Tabs */}
            <div className="flex items-center bg-gray-100 rounded-full p-1 w-fit">
                {[
                    { id: "roster", label: "Team Roster" },
                    { id: "performance", label: "Performance Comparison" },
                    { id: "permissions", label: "Permissions" },
                ].map((tab) => {
                    const isActive = activeTab === tab.id;

                    return (
                        <button
                            key={tab.id}
                            className={`
          px-5 py-2 text-sm font-medium transition
          ${isActive
                                    ? "bg-white shadow-sm rounded-full"
                                    : "text-gray-700"}
        `}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Table */}
            <div className="bg-white border rounded-xl shadow-sm">
                <table className="w-full">
                    <thead>
                        <tr className="border-b bg-gray-50 text-left text-sm text-gray-600">
                            <th className="py-3 px-4">Member</th>
                            <th className="py-3 px-4">Role</th>
                            <th className="py-3 px-4">Email</th>
                            <th className="py-3 px-4">Status</th>
                            <th className="py-3 px-4">Leads</th>
                            <th className="py-3 px-4">Pipeline</th>
                            <th className="py-3 px-4"></th>
                        </tr>
                    </thead>

                    <tbody>
                        {members.map((m) => (
                            <tr key={m.id} className="border-b hover:bg-gray-50 text-sm">
                                {/* Avatar + Name */}
                                <td className="py-3 px-4 flex items-center gap-3">
                                    <div className="w-9 h-9 flex items-center justify-center bg-gray-200 rounded-full text-sm font-medium">
                                        {m.name.charAt(0)}
                                    </div>
                                    {m.name}
                                </td>

                                <td className="py-3 px-4">
                                    <span className={`px-3 py-1 text-xs rounded-full ${m.roleColor}`}>
                                        {m.role}
                                    </span>
                                </td>

                                <td className="py-3 px-4">{m.email}</td>

                                <td className="py-3 px-4">
                                    <span className={`px-3 py-1 text-xs rounded-full ${m.statusColor}`}>
                                        {m.status}
                                    </span>
                                </td>

                                <td className="py-3 px-4">{m.leads}</td>
                                <td className="py-3 px-4">{m.pipeline}</td>

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
