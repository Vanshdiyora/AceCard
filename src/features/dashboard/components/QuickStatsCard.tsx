import type { QuickStats } from "../types";

interface Props {
  stats: QuickStats;
}

export default function QuickStatsCard({ stats }: Props) {
  const items = [
    {
      label: "Active Campaigns",
      value: stats.active_campaigns,
      change: "+3",
    },
    {
      label: "Team Members",
      value: stats.team_members,
      change: "+5",
    },
    {
      label: "Products in Catalog",
      value: stats.products,
      change: "+2",
    },
    {
      label: "Avg. Deal Size",
      value: `$${(stats.avg_deal_size / 1000).toFixed(1)}K`,
      change: "+12%",
    },
    {
      label: "Win Rate",
      value: `${stats.win_rate}%`,
      change: "+1.8%",
    },
  ];

  return (
    <div className="space-y-6">

      {/* QUICK STATS CARD */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border">
        <h3 className="font-semibold text-lg mb-4">Quick Stats</h3>

        <div className="space-y-4">
          {items.map((item, i) => (
            <div key={i} className="flex justify-between items-center">
              
              {/* LABEL */}
              <p className="text-gray-600">{item.label}</p>

              {/* VALUE + CHANGE */}
              <div className="flex items-center gap-3">
                <span className="font-semibold text-gray-900">{item.value}</span>
                <span className="text-green-600 font-semibold">{item.change}</span>
              </div>

            </div>
          ))}
        </div>
      </div>

      {/* QUICK ACTIONS */}
      <div className="bg-gradient-to-br from-purple-600 to-purple-800 p-6 rounded-2xl text-white space-y-4 shadow-md">

        <h3 className="font-semibold text-lg">Quick Actions</h3>

        <button className="w-full px-4 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-left font-medium">
          + Add New Lead
        </button>

        <button className="w-full px-4 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-left font-medium">
          + Create Campaign
        </button>

        <button className="w-full px-4 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-left font-medium">
          + Invite Team Member
        </button>

      </div>

    </div>
  );
}
