import { useState } from "react";
import { useAppSelector } from "../../../../app/hooks";
import StatCard from "../../../../common/components/cards/StatCard";

export default function VendorsPage() {
    const { stats, vendors } = useAppSelector((s) => s.superVendors);
    const [filter, setFilter] = useState("All");
    const [search, setSearch] = useState("");

    const filtered = vendors.filter((v) => {
        const statusMatch = filter === "All" || v.status === filter;
        const searchMatch =
            v.companyName.toLowerCase().includes(search.toLowerCase()) ||
            v.email.toLowerCase().includes(search.toLowerCase());
        return statusMatch && searchMatch;
    });

    return (
        <div className="space-y-8">

            {/* PAGE HEADER */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">Vendor Management</h1>
                    <p className="text-gray-600 text-sm">
                        Manage vendor onboarding, verification, and settings
                    </p>
                </div>

                <button className="px-5 py-2 bg-purple-600 text-white rounded-lg shadow">
                    + Add Vendor
                </button>
            </div>

            {/* STATS ROW */}
            <div className="grid grid-cols-4 gap-4">
                {stats.map((item, index) => (
                    <StatCard key={index} {...item} />
                ))}
            </div>

            {/* FILTERS + SEARCH */}
            <div className="bg-white rounded-xl shadow p-6">
                <h2 className="text-lg font-semibold mb-3">Vendors</h2>

                <div className="flex justify-between items-center">

                    {/* TABS */}
                    <div className="flex bg-gray-100 rounded-full p-1 w-fit space-x-1">
                        {["All", "Pending", "Verified", "Suspended"].map((tab) => {
                            const active = filter === tab;

                            return (
                                <button
                                    key={tab}
                                    onClick={() => setFilter(tab)}
                                    className={`
                                        px-4 py-1 rounded-full text-sm transition
                                        ${active ? "bg-white shadow font-semibold text-gray-900" : "text-gray-600 hover:text-gray-800"}
                                        `}
                                >
                                    {tab}
                                </button>
                            );
                        })}
                    </div>


                    {/* SEARCH */}
                    <input
                        placeholder="Search vendors..."
                        className="border px-4 py-2 rounded-lg w-72"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                {/* TABLE */}
                <table className="w-full mt-6 text-sm">
                    <thead>
                        <tr className="text-left text-gray-600 border-b">
                            <th className="py-3">Company Name</th>
                            <th>Contact Person</th>
                            <th>Email</th>
                            <th>GST No.</th>
                            <th>Domain</th>
                            <th>Seats</th>
                            <th>Status</th>
                            <th>Joined</th>
                            <th>Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {filtered.map((v) => (
                            <tr key={v.id} className="border-b">
                                <td className="py-3">{v.companyName}</td>
                                <td>{v.contactPerson}</td>
                                <td>{v.email}</td>
                                <td>{v.gst}</td>
                                <td>{v.domain}</td>
                                <td>{v.seats}</td>
                                <td>
                                    <span
                                        className={`px-2 py-1 text-xs rounded-full ${v.status === "Verified"
                                                ? "bg-green-100 text-green-600"
                                                : v.status === "Pending"
                                                    ? "bg-yellow-100 text-yellow-600"
                                                    : "bg-red-100 text-red-600"
                                            }`}
                                    >
                                        {v.status}
                                    </span>
                                </td>
                                <td>{v.joined}</td>

                                <td>
                                    <button className="px-2">⋮</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
