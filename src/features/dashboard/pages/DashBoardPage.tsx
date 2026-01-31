import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { fetchDashboard, setPeriod } from "../slice";

import { Users, MousePointerClick, Percent, TrendingUp } from "lucide-react";

import QuickStatsCard from "../components/QuickStatsCard";
import RecentActivity from "../components/RecentActivity";

import StatCardSkeleton from "../../../common/components/skeleton/StatCardSkeleton";
import ChartSkeleton from "../../../common/components/skeleton/ChartSkeleton";
import ActivitySkeleton from "../../../common/components/skeleton/ActivitySkeleton";
import ErrorAlert from "../../../common/ui/ErrorAlert";
import StatCard from "../../../common/components/cards/StatCard";

import PipelineAreaChart from "../../../common/components/cards/PipelineAreaChart";

/* -----------------------------------------------------
   PERIOD OPTIONS
----------------------------------------------------- */
const periods = ["day", "week", "month", "year"] as const;

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const { data, loading, error, period } = useAppSelector(
    (s) => s.dashboard
  );

  useEffect(() => {
    dispatch(fetchDashboard(period));
  }, [dispatch, period]);

  return (
    <div className="p-6 space-y-6 max-w-full overflow-x-hidden">
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

      {/* PIPELINE CHART */}
      <div className="bg-white rounded-2xl shadow-sm p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">
            Pipeline Over Time
          </h3>

          {/* PURPLE FILTER */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-full p-1">
            {periods.map((p) => (
              <button
                key={p}
                onClick={() => dispatch(setPeriod(p))}
                className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-all
                  ${
                    period === p
                      ? "bg-purple-500 text-white shadow"
                      : "text-gray-500 hover:text-gray-800"
                  }`}
              >
                {p.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {error ? null : loading ? (
          <ChartSkeleton />
        ) : data ? (
          <PipelineAreaChart
            data={data.pipeline_graph}
            color="#a855f7"
          />
        ) : null}
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {error ? null : loading ? (
            <ActivitySkeleton />
          ) : data ? (
            <RecentActivity items={data.recent_activity ?? []} />
          ) : null}
        </div>

        <div>
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
  );
}
