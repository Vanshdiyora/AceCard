import CampaignCard from "../../../../common/components/cards/CampaignCard";
import CampaignFunnelChart from "../../../../common/components/charts/CampaignFunnelChart";
import LeaderboardChart from "../../../../common/components/charts/LeaderboardChart";
import { useAppSelector } from "../../../../app/hooks";

export default function CampaignsPage() {
  const campaigns = useAppSelector((state) => state.campaigns.items);

  return (
    <div className="p-6 space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Campaigns</h2>
          <p className="text-gray-500">
            Manage and track your marketing campaigns
          </p>
        </div>

        <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-lg text-sm">
          + New Campaign
        </button>
      </div>

      {/* Campaign Cards */}
      <div className="grid grid-cols-4 gap-5">
        {campaigns.map((c) => (
          <CampaignCard key={c.id} {...c} />
        ))}
      </div>

      {/* Funnel + Leaderboard */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="font-semibold mb-4">Campaign Funnel</h3>
          <CampaignFunnelChart />
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="font-semibold mb-4">Performance Leaderboard</h3>
          <LeaderboardChart />
        </div>
      </div>
    </div>
  );
}
