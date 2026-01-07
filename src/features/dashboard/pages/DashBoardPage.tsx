import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { fetchDashboard } from "../slice";

import StatsRow from "../../../common/components/cards/StatRow";
import { Users, MousePointerClick, Percent, TrendingUp } from "lucide-react";


// import StatCard from "../../../common/components/cards/StatCard";
import QuickStatsCard from "../components/QuickStatsCard";
import RecentActivity from "../components/RecentActivity";

import StatCardSkeleton from "../../../common/components/skeleton/StatCardSkeleton";
import ChartSkeleton from "../../../common/components/skeleton/ChartSkeleton";
import ActivitySkeleton from "../../../common/components/skeleton/ActivitySkeleton";

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const { data, loading } = useAppSelector((s) => s.dashboard);

  useEffect(() => {
    dispatch(fetchDashboard());
  }, []);

  return (
    <div className="p-6 space-y-6 max-w-full overflow-x-hidden">

      {/* KPI CARDS */}
      {loading || !data ? (
        <StatCardSkeleton />
      ) : (
        <StatsRow
        items={[
          {
            title: "Pipeline Generated",
            value: `$${data.pipeline.value}`,
            change: data.pipeline.percentage,
            icon: <TrendingUp size={18} />
          },
          {
              title: "Total Visits",
              value: data.card_taps.value,
              change: data.card_taps.percentage,
              icon: <MousePointerClick size={18} />
            },
            {
              title: "Total Leads Generated",
              value: data.leads_captured.value,
              change: data.leads_captured.percentage,
              icon: <Users size={18} />
            },
            {
              title: "Tap-to-lead-Ratio",
              value: `${data.tap_lead_ratio.value}%`,
              change: data.tap_lead_ratio.percentage,
              icon: <Percent size={18} />
            },
          ]}
        />
      )}

      <div className="col-span-2">
          {loading || !data ? (
            <ActivitySkeleton />
          ) : (
            <RecentActivity items={data.recent_activity} />
          )}
        </div>

      {/* BOTTOM SECTION */}
      {/* Activity + Quick Stats */}
      <div className="grid gap-6">

        <div>
          {loading || !data ? (
            <ChartSkeleton />
          ) : (
            <QuickStatsCard stats={data.quick_stats} />
          )}
        </div>
      </div>

    </div>
  );
}
