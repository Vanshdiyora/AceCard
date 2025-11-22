import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../../../app/hooks";

import { loadDashboard } from "../../../../features/admin/DashBoard/DashBoardSlice";

import StatCard from "../../../../common/components/cards/StatCard";
import PipelineChart from "../../../../common/components/charts/PipelineChart";
import PieLeadChart from "../../../../common/components/charts/PieleadChart";
import RecentActivity from "../../../../common/components/activity/RecentActivity";

import StatCardSkeleton from "../../../../common/components/skeleton/StatCardSkeleton";
import ChartSkeleton from "../../../../common/components/skeleton/ChartSkeleton";
import ActivitySkeleton from "../../../../common/components/skeleton/ActivitySkeleton";

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const { stats, loading } = useAppSelector((s) => s.dashboard);

  // 🔥 Trigger loading + artificial delay when page opens
  useEffect(() => {
    dispatch(loadDashboard());
  }, [dispatch]);

  return (
    <div className="p-6 space-y-6">

      {/* Stats */}
      <div className="grid grid-cols-4 gap-6">
        {loading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <StatCard
              title="Pipeline Generated"
              value={`$${stats?.pipelineGenerated}`}
              change="12.5%"
              positive
            />
            <StatCard
              title="Leads Captured"
              value={`${stats?.leadsCaptured}`}
              change="8.2%"
              positive
            />
            <StatCard
              title="Total Card Taps"
              value={`${stats?.totalCardTaps}`}
              change="2.1%"
            />
            <StatCard
              title="Tap-to-Lead Ratio"
              value={`${stats?.ratio}%`}
              change="3.8%"
              positive
            />
          </>
        )}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-6">

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="font-semibold mb-4">Pipeline Trend</h3>
          {loading ? <ChartSkeleton /> : <PipelineChart />}
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="font-semibold mb-4">Lead Distribution</h3>
          {loading ? <ChartSkeleton /> : <PieLeadChart />}
        </div>

      </div>

      {/* Activity */}
      {loading ? <ActivitySkeleton /> : <RecentActivity />}

    </div>
  );
}
