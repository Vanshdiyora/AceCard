import { useState } from "react";
import { useAppSelector } from "../../../../app/hooks";
import StatCard from "../../../../common/components/cards/StatCard";
import { Copy, RefreshCcw } from "lucide-react";
import UtilizationBar from "../../../../common/ui/UtilizationBar";

export default function SeatsKeysPage() {
  const { stats, vendors } = useAppSelector((state) => state.superSeats);

  const [search, setSearch] = useState("");

  const filtered = vendors.filter((v) =>
    v.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-semibold">Seat Allotment & Key Generation</h1>
        <p className="text-gray-500">
          Manage seat allocation and access keys for vendors
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-5">
        <StatCard
          title="Total Seats Allocated"
          value={stats.totalAllocated}
          change="12%"
          positive
        />
        <StatCard
          title="Seats In Use"
          value={stats.seatsInUse}
          change="8%"
          positive
        />
        <StatCard
          title="Available Seats"
          value={stats.available}
          change="5%"
          positive={false}
        />
        <StatCard
          title="Utilization Rate"
          value={stats.utilization}
          change="3%"
          positive
        />
      </div>

      {/* Main White Container Box */}
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Seat Allocations</h2>

          <input
            type="text"
            placeholder="Search vendors..."
            className="border px-3 py-2 rounded-lg w-64"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Table */}
        <table className="w-full border-collapse">
          <thead>
            <tr className="text-left text-gray-600 border-b">
              <th className="py-3">Vendor Name</th>
              <th>Total Seats</th>
              <th>Used Seats</th>
              <th>Utilization</th>
              <th>Access Key</th>
              <th>Expiry Date</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((vendor, i) => (
              <tr key={i} className="border-b text-gray-700">
                <td className="py-3">{vendor.name}</td>

                <td>{vendor.totalSeats}</td>
                <td>{vendor.usedSeats}</td>

                <td>
                  <UtilizationBar percent={parseInt(vendor.utilization)} />
                </td>

                <td className="flex items-center gap-2 py-3">
                  <span className="font-mono bg-gray-100 px-2 py-1 rounded-md text-sm">
                    {vendor.accessKey}
                  </span>
                  <Copy className="w-4 cursor-pointer text-gray-500" />
                </td>

                <td>{vendor.expiry}</td>

                {/* Status tag */}
                <td>
                  {vendor.status === "Active" ? (
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-lg text-sm">
                      Active
                    </span>
                  ) : (
                    <span className="bg-red-100 text-red-600 px-3 py-1 rounded-lg text-sm">
                      Suspended
                    </span>
                  )}
                </td>

                {/* Action Buttons */}
                <td>
                  <div className="flex justify-end gap-2">
                    <button className="flex items-center gap-1 border px-3 py-1 rounded-lg">
                      Edit Seats
                    </button>
                    <button className="flex items-center gap-1 border px-3 py-1 rounded-lg">
                      <RefreshCcw size={16} /> Regenerate Key
                    </button>

                    {vendor.status === "Active" ? (
                      <button className="flex items-center gap-1 text-red-600 border px-3 py-1 rounded-lg w-20">
                        Revoke
                      </button>
                    ) : (
                      <button className="flex items-center gap-1 text-green-600 border px-3 py-1 rounded-lg w-20">
                         Activate
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
