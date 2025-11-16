import { useState } from "react";
import { useAppSelector } from "../../../../app/hooks";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Download } from "lucide-react";

export default function InsightsPage() {
  const { metrics, revenueData } = useAppSelector((s) => s.insights);
  const [tab, setTab] = useState("revenue");

  return (
    <div className="p-6 space-y-8">

      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold">Insights</h2>
          <p className="text-gray-500">Analytics and performance metrics</p>
        </div>

        <div className="flex gap-3">
          <button className="border px-4 py-2 rounded-lg bg-white flex items-center gap-2">
            <Download size={16} />
            Export CSV
          </button>

          <button className="border px-4 py-2 rounded-lg bg-white flex items-center gap-2">
            <Download size={16} />
            Export PDF
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-4 gap-4">
        {/* Total Pipeline */}
        <div className="border rounded-xl bg-white p-6">
          <p className="text-gray-600">Total Pipeline</p>
          <h3 className="text-3xl font-semibold mt-2">{metrics.pipeline}</h3>
          <p className="text-green-600 mt-1 text-sm">{metrics.pipelineGrowth}</p>
        </div>

        {/* Conversion Rate */}
        <div className="border rounded-xl bg-white p-6">
          <p className="text-gray-600">Avg Conversion Rate</p>
          <h3 className="text-3xl font-semibold mt-2">{metrics.conversionRate}</h3>
          <p className="text-green-600 mt-1 text-sm">{metrics.conversionGrowth}</p>
        </div>

        {/* Active Campaigns */}
        <div className="border rounded-xl bg-white p-6">
          <p className="text-gray-600">Active Campaigns</p>
          <h3 className="text-3xl font-semibold mt-2">{metrics.activeCampaigns}</h3>
          <p className="text-red-600 mt-1 text-sm">{metrics.campaignChange}</p>
        </div>

        {/* Team Size */}
        <div className="border rounded-xl bg-white p-6">
          <p className="text-gray-600">Team Size</p>
          <h3 className="text-3xl font-semibold mt-2">{metrics.teamSize}</h3>
          <p className="text-green-600 mt-1 text-sm">{metrics.teamGrowth}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center bg-gray-100 rounded-full p-1 w-fit">
        {[
          { id: "revenue", label: "Revenue & Pipeline" },
          { id: "funnel", label: "Conversion Funnel" },
          { id: "team", label: "Team Performance" },
          { id: "activity", label: "Activity Timeline" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-5 py-2 text-sm font-medium transition ${
              tab === t.id ? "bg-white shadow-sm rounded-full" : "text-gray-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Chart */}
      {tab === "revenue" && (
        <div className="bg-white border rounded-xl p-6 shadow-sm">
          <h3 className="font-semibold mb-4">Pipeline vs Closed Revenue</h3>

          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={revenueData}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="pipeline"
                stroke="#8b5cf6"
                fill="#c4b5fd"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="closed"
                stroke="#6366f1"
                fill="#a5b4fc"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
