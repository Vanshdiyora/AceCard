import { useState } from "react";
import { useAppSelector } from "../../../../app/hooks";
import ApproveSalespersonModal from "./ApproveSalespersonModal";
import RejectSalespersonModal from "./RejectSalespersonModal";

export default function SalespersonsPage() {
    const { stats, list } = useAppSelector((s) => s.superSalespersons);

    const [filter, setFilter] = useState<
        "All" | "Pending" | "Approved" | "Rejected"
    >("Pending");

    const [selectedSP, setSelectedSP] = useState<any>(null);
    const [showApprove, setShowApprove] = useState(false);
    const [showReject, setShowReject] = useState(false);

    const filtered = list.filter((sp) =>
        filter === "All" ? true : sp.status === filter
    );

    return (
        <div className="p-6 space-y-6">
            {/* Title */}
            <div>
                <h1 className="text-2xl font-bold">Salesperson Approval</h1>
                <p className="text-gray-500">
                    Review and approve salesperson registrations
                </p>
            </div>

            {/* STATS CARDS */}
            <div className="grid grid-cols-4 gap-4">
                <MiniCard label="Total Registrations" value={stats.total} />
                <MiniCard label="Pending Approval" value={stats.pending} />
                <MiniCard label="Approved" value={stats.approved} />
                <MiniCard label="Rejected" value={stats.rejected} />
            </div>

            {/* FILTER + SEARCH */}
            <div className="bg-white rounded-xl shadow-sm border p-6 space-y-6">
                <div className="flex justify-between items-center">
                    <div className="p-1 font-medium">Salesperson Registrations</div>
                       <input
                        placeholder="Search salespersons..."
                        className="border rounded-lg px-4 py-2 w-72"
                    />
                </div>
                <div className="flex justify-between items-center">
                    <div className="flex bg-gray-100 p-1 rounded-full space-x-2">
                        {["Pending", "Approved", "Rejected", "All"].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setFilter(tab as any)}
                                className={`px-4 py-1 rounded-full text-sm font-medium ${filter === tab
                                        ? "bg-white shadow text-purple-600"
                                        : "text-gray-600"
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                 
                </div>

                {/* TABLE */}
                <div className="bg-white rounded-xl shadow-sm p-6 overflow-x-auto">
                    <table className="w-full text-sm table-auto">
                        <thead>
                            <tr className="text-gray-600 border-b">
                                <th className="py-3 px-4 text-left font-medium">Salesperson</th>
                                <th className="py-3 px-4 text-left font-medium">Contact</th>
                                <th className="py-3 px-4 text-left font-medium">Vendor</th>
                                <th className="py-3 px-4 text-left font-medium">Manager</th>
                                <th className="py-3 px-4 text-left font-medium">Role</th>
                                <th className="py-3 px-4 text-left font-medium">Registered</th>
                                <th className="py-3 px-4 text-left font-medium">Status</th>
                                <th className="py-3 px-4 text-right font-medium">Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filtered.map((sp) => (
                                <tr
                                    key={sp.id}
                                    className="border-b hover:bg-gray-50 transition-colors"
                                >
                                    {/* Salesperson */}
                                    <td className="py-4 px-4 flex items-center space-x-3">
                                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center font-semibold text-purple-600">
                                            {sp.name.split(" ").map((x) => x[0]).join("")}
                                        </div>
                                        <div>
                                            <p className="font-medium">{sp.name}</p>
                                            <p className="text-gray-500 text-xs">{sp.email}</p>
                                        </div>
                                    </td>

                                    {/* Contact */}
                                    <td className="py-4 px-4">{sp.phone}</td>

                                    {/* Vendor */}
                                    <td className="py-4 px-4">{sp.vendor}</td>

                                    {/* Manager */}
                                    <td className="py-4 px-4">{sp.manager}</td>

                                    {/* Role */}
                                    <td className="py-4 px-4">{sp.role}</td>

                                    {/* Registered */}
                                    <td className="py-4 px-4">{sp.registered}</td>

                                    {/* Status */}
                                    <td className="py-4 px-4">
                                        <StatusBadge status={sp.status} />
                                    </td>

                                    {/* Actions */}
                                    <td className="py-4 px-4 text-right space-x-2 whitespace-nowrap">

                                        {/* APPROVE BUTTON */}
                                        <button
                                            className="px-4 py-1.5 bg-green-600 text-white rounded-lg text-xs items-center gap-1 inline-flex"
                                            onClick={() => {
                                                setSelectedSP(sp);
                                                setShowApprove(true);
                                            }}
                                        >
                                            ✓ Approve
                                        </button>

                                        {/* REJECT BUTTON */}
                                        <button
                                            className="px-4 py-1.5 text-red-600 border border-red-600 rounded-lg text-xs items-center gap-1 inline-flex"
                                            onClick={() => {
                                                setSelectedSP(sp);
                                                setShowReject(true);
                                            }}
                                        >
                                            ✕ Reject
                                        </button>

                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>


            {/* APPROVE MODAL */}
            {showApprove && selectedSP && (
                <ApproveSalespersonModal
                    open={showApprove}
                    data={selectedSP}
                    onClose={() => setShowApprove(false)}
                    onApprove={() => {
                        console.log("Approved:", selectedSP);
                        setShowApprove(false);
                    }}
                />
            )}

            {/* REJECT MODAL */}
            {showReject && selectedSP && (
                <RejectSalespersonModal
                    open={showReject}
                    data={selectedSP}
                    onClose={() => setShowReject(false)}
                    onReject={(reason) => {
                        console.log("Rejected:", selectedSP, "Reason:", reason);
                        setShowReject(false);
                    }}
                />
            )}
        </div>
    );
}

function MiniCard({ label, value }: any) {


    return (
        <div className="p-5 bg-white rounded-xl shadow-sm border">
            <p className="text-gray-500 text-sm">{label}</p>
            <h2 className="text-2xl font-semibold mt-1">{value}</h2>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const styles: any = {
        Pending: "bg-yellow-100 text-yellow-600",
        Approved: "bg-green-100 text-green-600",
        Rejected: "bg-red-100 text-red-600",
    };

    return (
        <span className={`px-3 py-1 rounded-full text-xs ${styles[status]}`}>
            {status}
        </span>
    );
}
