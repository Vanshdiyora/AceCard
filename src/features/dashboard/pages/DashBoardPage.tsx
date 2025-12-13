import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { fetchDashboard } from "../slice";

import StatCard from "../../../common/components/cards/StatCard";
import QuickStatsCard from "../components/QuickStatsCard";
import RatioLineChart from "../components/RatioLineChart";
import RepPerformanceChart from "../components/RepPerformanceChart";
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
    <div className="p-6 space-y-6">

      {/* KPI CARDS */}
      <div className="grid grid-cols-5 gap-6">
        {loading || !data ? (
          [...Array(5)].map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <StatCard
              title="Pipeline Generated"
              value={`$${data.pipeline.value}`}
              change={data.pipeline.percentage}
            />

            <StatCard
              title="Leads Captured"
              value={data.leads_captured.value}
              change={data.leads_captured.percentage}
            />

            <StatCard
              title="Total Card Taps"
              value={data.card_taps.value}
              change={data.card_taps.percentage}
            />

            <StatCard
              title="Tap → Lead Ratio"
              value={`${data.tap_lead_ratio.value}%`}
              change={data.tap_lead_ratio.percentage}
            />

            <StatCard
              title="Conversion %"
              value={`${data.conversion_rate.value}%`}
              change={data.conversion_rate.percentage}
            />
          </>
        )}
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 bg-white p-6 rounded-xl shadow border">
          <h3 className="font-semibold mb-4">Tap → Lead Ratio Over Time</h3>
          {loading || !data ? (
            <ChartSkeleton />
          ) : (
            <RatioLineChart data={data.tap_lead_ratio_over_time} />
          )}
        </div>

        <div className="bg-white p-6 rounded-xl shadow border">
          <h3 className="font-semibold mb-4">Reps by Performance</h3>
          {loading || !data ? (
            <ChartSkeleton />
          ) : (
            <RepPerformanceChart data={data.rep_performance} />
          )}
        </div>
      </div>

      {/* BOTTOM SECTION */}
      {/* Activity + Quick Stats */}
<div className="grid grid-cols-3 gap-6">
  <div className="col-span-2">
    {loading || !data ? (
      <ActivitySkeleton />
    ) : (
      <RecentActivity items={data.recent_activity} />
    )}
  </div>

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
