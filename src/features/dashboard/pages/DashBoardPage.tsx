import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { fetchDashboard } from "../slice";

import { Users, MousePointerClick, Percent, TrendingUp } from "lucide-react";

import QuickStatsCard from "../components/QuickStatsCard";
import RecentActivity from "../components/RecentActivity";

import StatCardSkeleton from "../../../common/components/skeleton/StatCardSkeleton";
import ChartSkeleton from "../../../common/components/skeleton/ChartSkeleton";
import ActivitySkeleton from "../../../common/components/skeleton/ActivitySkeleton";
import ErrorAlert from "../../../common/ui/ErrorAlert";
import StatCard from "../../../common/components/cards/StatCard";

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
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            title="Pipeline Generated"
            value={`$${data.pipeline.value}`}
            change={data.pipeline.percentage}
            positive={data.pipeline.percentage >= 0}
            icon={<TrendingUp size={18} />}
            color="green"
          />

          <StatCard
            title="Total Visits"
            value={data.card_taps.value}
            change={data.card_taps.percentage}
            positive={data.card_taps.percentage >= 0}
            icon={<MousePointerClick size={18} />}
            color="blue"
          />

          <StatCard
            title="Total Leads Generated"
            value={data.leads_captured.value}
            change={data.leads_captured.percentage}
            positive={data.leads_captured.percentage >= 0}
            icon={<Users size={18} />}
            color="purple"
          />

          <StatCard
            title="Tap-to-lead-Ratio"
            value={`${data.tap_lead_ratio.value}%`}
            change={data.tap_lead_ratio.percentage}
            positive={data.tap_lead_ratio.percentage >= 0}
            icon={<Percent size={18} />}
            color="orange"
          />

        </div>
      ) : null}


      {/* MAIN DASHBOARD GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        <div className="lg:col-span-2 flex">
          <div className="flex-1">
            {error ? null : loading ? (
              <ActivitySkeleton />
            ) : data ? (
              <RecentActivity items={data.recent_activity ?? []} />
            ) : null}
          </div>
        </div>

        <div className="flex flex-col h-full">
          <div className="h-full flex flex-col justify-between">
            {/* Top Performers */}
            <div className="shrink-0 mb-6">
              {error ? null : loading ? (
                <ChartSkeleton />
              ) : data ? (
                <QuickStatsCard
                  topPerformers={data.top_performers}
                />

              ) : null}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
