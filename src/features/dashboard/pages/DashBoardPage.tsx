import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { fetchDashboard } from "../slice";

import StatsRow from "../../../common/components/cards/StatRow";
import { Users, MousePointerClick, Percent, TrendingUp } from "lucide-react";

import QuickStatsCard from "../components/QuickStatsCard";
import RecentActivity from "../components/RecentActivity";

import StatCardSkeleton from "../../../common/components/skeleton/StatCardSkeleton";
import ChartSkeleton from "../../../common/components/skeleton/ChartSkeleton";
import ActivitySkeleton from "../../../common/components/skeleton/ActivitySkeleton";
import ErrorAlert from "../../../common/ui/ErrorAlert";

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const { data, loading, error } = useAppSelector((s) => s.dashboard);

  useEffect(() => {
    dispatch(fetchDashboard());
  }, [dispatch]);

  return (
    <div className="p-6 space-y-6 max-w-full overflow-x-hidden">

      {/* ERROR */}
      {error && <ErrorAlert message={error} />}

      {/* KPI CARDS */}
      {error ? null : loading ? (
        <StatCardSkeleton />
      ) : data ? (
        <StatsRow
          items={[
            {
              title: "Pipeline Generated",
              value: `$${data.pipeline.value}`,
              change: data.pipeline.percentage,
              icon: <TrendingUp size={18} />,
            },
            {
              title: "Total Visits",
              value: data.card_taps.value,
              change: data.card_taps.percentage,
              icon: <MousePointerClick size={18} />,
            },
            {
              title: "Total Leads Generated",
              value: data.leads_captured.value,
              change: data.leads_captured.percentage,
              icon: <Users size={18} />,
            },
            {
              title: "Tap-to-lead-Ratio",
              value: `${data.tap_lead_ratio.value}%`,
              change: data.tap_lead_ratio.percentage,
              icon: <Percent size={18} />,
            },
          ]}
        />
      ) : null}

      {/* RECENT ACTIVITY */}
      <div className="col-span-2">
        {error ? null : loading ? (
          <ActivitySkeleton />
        ) : data ? (
          <RecentActivity items={data.recent_activity ?? []} />
        ) : null}
      </div>

      {/* QUICK STATS */}
      <div className="grid gap-6">
        <div>
          {error ? null : loading ? (
            <ChartSkeleton />
          ) : data ? (
            <QuickStatsCard stats={data.quick_stats} />
          ) : null}
        </div>
      </div>
    </div>
  );
}
