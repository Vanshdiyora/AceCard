import { useParams, useNavigate } from "react-router-dom";
import { Mail, Phone, MapPin, Edit, Trash2 } from "lucide-react";
import { useAppSelector, useAppDispatch } from "../../../app/hooks";
import { updateLead, archiveLead } from "../slice";

import EditLeadModal from "../components/EditLeadModal";
import { useState } from "react";

export default function LeadDetailsPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    // Modal state
    const [editOpen, setEditOpen] = useState(false);

    // Get leads from Redux
    const { leads } = useAppSelector((s) => s.leads);

    const lead = leads.find((l) => l.id === Number(id));
    if (!lead) return <div className="p-6">Lead not found</div>;

    // Edit Lead
    const handleEdit = () => {
        setEditOpen(true);
    };

    // Archive Lead
    const handleArchive = () => {
        if (confirm("Are you sure you want to archive this lead?")) {
            dispatch(archiveLead(lead.id));
            navigate("/admin/leads");
        }
    };

    return (
        <div className="p-6 space-y-6">
            {/* Back Button */}
            <button
                onClick={() => navigate(-1)}
                className="flex items-center text-gray-600 hover:text-black text-sm"
            >
                ← Back to Leads
            </button>

            {/* Top Section */}
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-purple-600 text-white flex items-center justify-center text-2xl font-semibold">
                        {lead.lead_name[0]}
                    </div>

                    <div>
                        <h2 className="text-2xl font-semibold">{lead.lead_name}</h2>
                        <p className="text-gray-500">{lead.company}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={handleEdit}
                        className="flex items-center gap-2 px-4 py-2 border rounded-lg text-sm hover:bg-gray-50"
                    >
                        <Edit size={16} /> Edit
                    </button>

                    <button
                        onClick={handleArchive}
                        className="flex items-center gap-2 px-4 py-2 border rounded-lg text-sm text-red-600 hover:bg-red-50"
                    >
                        <Trash2 size={16} /> Archive
                    </button>
                </div>
            </div>

            {/* Contact Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border rounded-xl p-4 flex items-center gap-3 bg-white shadow-sm">
                    <Mail size={20} className="text-purple-600" />
                    <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium">{lead.email}</p>
                    </div>
                </div>

                <div className="border rounded-xl p-4 flex items-center gap-3 bg-white shadow-sm">
                    <Phone size={20} className="text-orange-500" />
                    <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="font-medium">{lead.phone}</p>
                    </div>
                </div>

                <div className="border rounded-xl p-4 flex items-center gap-3 bg-white shadow-sm">
                    <MapPin size={20} className="text-blue-500" />
                    <div>
                        <p className="text-sm text-gray-500">Location</p>
                        <p className="font-medium">Not provided</p>
                    </div>
                </div>
            </div>

            {/* Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* LEFT PANEL */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-xl border p-4 shadow-sm">
                        <div className="flex gap-6 border-b pb-3 text-sm">
                            <button className="text-purple-600 font-medium border-b-2 border-purple-600 pb-2">
                                Overview
                            </button>
                            <button className="text-gray-500 hover:text-black">Notes</button>
                            <button className="text-gray-500 hover:text-black">Files</button>
                            <button className="text-gray-500 hover:text-black">Tasks</button>
                            <button className="text-gray-500 hover:text-black">Meetings</button>
                            <button className="text-gray-500 hover:text-black">Campaign History</button>
                        </div>

                        {/* Overview Content */}
                        <div className="p-4 grid grid-cols-2 gap-6 text-sm">
                            <div>
                                <p className="text-gray-500">Status</p>
                                <span className="px-2 py-1 bg-red-100 text-red-600 rounded-full text-xs">
                                    {lead.stage}
                                </span>
                            </div>

                            <div>
                                <p className="text-gray-500">Owner</p>
                                <p className="font-medium">Assigned Person</p>
                            </div>

                            <div>
                                <p className="text-gray-500">Source</p>
                                <p className="font-medium">{lead.source}</p>
                            </div>

                            <div>
                                <p className="text-gray-500">Created</p>
                                <p className="font-medium">
                                    {new Date(lead.created_at).toLocaleDateString()}
                                </p>
                            </div>

                            <div>
                                <p className="text-gray-500">Last Contact</p>
                                <p className="font-medium">
                                    {new Date(lead.last_interaction_at).toLocaleString()}
                                </p>
                            </div>

                            <div>
                                <p className="text-gray-500">Deal Value</p>
                                <p className="font-medium">${lead.deal_amount}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT PANEL */}
                <div className="space-y-6">
                    <div className="bg-white border rounded-xl p-5 shadow-sm">
                        <p className="text-gray-500 text-sm mb-1">Deal Value</p>
                        <h3 className="text-2xl font-bold">${lead.deal_amount}</h3>

                        <p className="mt-4 text-gray-500 text-sm">Probability</p>
                        <div className="w-full bg-gray-200 h-2 rounded-full mt-1">
                            <div className="h-2 bg-purple-500 rounded-full" style={{ width: "75%" }}></div>
                        </div>
                        <p className="text-right text-sm text-gray-600 mt-1">75%</p>
                    </div>

                    <div className="bg-white border rounded-xl p-5 shadow-sm">
                        <p className="font-medium mb-3">Quick Actions</p>

                        <div className="space-y-2 text-sm">
                            <button className="w-full px-4 py-2 bg-purple-50 rounded-lg flex items-center gap-2 text-purple-700">
                                <Mail size={16} /> Send Email
                            </button>

                            <button className="w-full px-4 py-2 bg-orange-50 rounded-lg flex items-center gap-2 text-orange-600">
                                <Phone size={16} /> Make Call
                            </button>

                            <button className="w-full px-4 py-2 bg-blue-50 rounded-lg flex items-center gap-2 text-blue-600">
                                📅 Schedule Meeting
                            </button>

                            <button className="w-full px-4 py-2 bg-pink-50 rounded-lg flex items-center gap-2 text-pink-600">
                                📄 Create Proposal
                            </button>
                        </div>
                    </div>

                    <div className="bg-white border rounded-xl p-5 shadow-sm">
                        <p className="font-medium mb-3">Recent Activity</p>

                        <div className="space-y-3 text-sm">
                            <div>
                                <p className="font-medium">Email sent</p>
                                <p className="text-gray-500">Proposal delivered</p>
                                <p className="text-xs text-gray-400">2 hours ago</p>
                            </div>

                            <div>
                                <p className="font-medium">Call completed</p>
                                <p className="text-gray-500">Discovery call</p>
                                <p className="text-xs text-gray-400">1 day ago</p>
                            </div>

                            <div>
                                <p className="font-medium">Note added</p>
                                <p className="text-gray-500">Budget approved</p>
                                <p className="text-xs text-gray-400">2 days ago</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ⭐ Edit Lead Modal */}
            <EditLeadModal
                open={editOpen}
                lead={lead}
                onClose={() => setEditOpen(false)}
                onSubmit={(data: any) => {
                    dispatch(updateLead({ id: lead.id, data }));
                    setEditOpen(false);
                }}
            />
        </div>
    );
}
