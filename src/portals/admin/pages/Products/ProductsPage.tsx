import { useState } from "react";
import { useAppSelector } from "../../../../app/hooks";
import { Search, Plus } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function ProductsPage() {
  const { products, stats } = useAppSelector((state) => state.products);
  const [search, setSearch] = useState("");

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  // Chart Data
  const chartData = products.map((p) => ({
    name: p.name.split(" ")[0], // Enterprise -> Professional -> Starter -> ...
    leads: p.leads,
    opportunities: p.opportunities,
  }));

  return (
    <div className="p-6 space-y-6">
      {/* Title Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold">Products</h2>
          <p className="text-gray-500">Manage your product catalog</p>
        </div>

        <div className="flex items-center gap-3">
          <button className="border px-4 py-2 rounded-lg bg-white">
            Import from Excel
          </button>

          <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
            <Plus size={18} />
            Add Product
          </button>
        </div>
      </div>

      {/* Statistic Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border rounded-xl p-5 shadow-sm">
          <p className="text-gray-500">Total Products</p>
          <h3 className="text-3xl font-semibold mt-2">{stats.totalProducts}</h3>
          <p className="text-sm text-gray-500 mt-1">{stats.activeProducts} active</p>
        </div>

        <div className="bg-white border rounded-xl p-5 shadow-sm">
          <p className="text-gray-500">Total Opportunities</p>
          <h3 className="text-3xl font-semibold mt-2">{stats.totalOpportunities}</h3>
          <p className="text-sm text-gray-500">Across all products</p>
        </div>

        <div className="bg-white border rounded-xl p-5 shadow-sm">
          <p className="text-gray-500">Potential Revenue</p>
          <h3 className="text-3xl font-semibold mt-2 text-green-600">
            {stats.totalRevenue}
          </h3>
          <p className="text-sm text-gray-500">From active products</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative w-full">
        <Search size={18} className="absolute left-3 top-3 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products..."
          className="w-full border rounded-lg py-3 pl-10 pr-4 text-sm"
        />
      </div>

      {/* Product Table */}
      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-gray-50 text-left text-sm text-gray-600">
              <th className="py-3 px-4">Product Name</th>
              <th className="py-3 px-4">SKU</th>
              <th className="py-3 px-4">Price</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Leads</th>
              <th className="py-3 px-4">Opportunities</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="border-b hover:bg-gray-50 text-sm">
                <td className="py-3 px-4">{p.name}</td>
                <td className="py-3 px-4">{p.sku}</td>
                <td className="py-3 px-4">{p.price}</td>

                <td className="py-3 px-4">
                  <span className={`px-3 py-1 text-xs rounded-full ${p.statusColor}`}>
                    {p.status}
                  </span>
                </td>

                <td className="py-3 px-4">{p.leads}</td>
                <td className="py-3 px-4">{p.opportunities}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Product Performance Chart */}
      <div className="bg-white border rounded-xl shadow-sm p-6">
        <h3 className="font-semibold mb-4">Product Performance</h3>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="leads" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
            <Bar dataKey="opportunities" fill="#6366f1" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
