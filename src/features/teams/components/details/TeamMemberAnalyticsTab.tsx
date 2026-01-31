// TeamMemberAnalyticsTab.tsx
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../../app/hooks";
import { fetchMemberAnalytics } from "../../slice";

export default function TeamMemberAnalyticsTab({
  memberId,
}: {
  memberId: number;
}) {
  const dispatch = useAppDispatch();
  const { analytics, analyticsLoading } = useAppSelector(
    (s) => s.team
  );

  const [period, setPeriod] = useState<"week" | "month" | "year">("month");

  useEffect(() => {
    dispatch(fetchMemberAnalytics({ id: memberId, pipeline_period: period }));
  }, [memberId, period, dispatch]);

  if (analyticsLoading)
    return <div className="p-6">Loading analytics…</div>;

  if (!analytics)
    return <div className="p-6 text-gray-500">No data</div>;

  return (
    <div className="mt-6 space-y-4">
      <div className="flex gap-2">
        {["week", "month", "year"].map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p as any)}
            className={`px-3 py-1 rounded text-sm ${
              period === p
                ? "bg-purple-600 text-white"
                : "bg-gray-100"
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="card">
          <p className="text-gray-500 text-sm">Total Leads</p>
          <p className="text-2xl font-semibold">
            {analytics.total_leads}
          </p>
        </div>

        <div className="card">
          <p className="text-gray-500 text-sm">Pipeline</p>
          <p className="text-2xl font-semibold">
            ₹{analytics.total_deal_amount}
          </p>
        </div>

        <div className="card">
          <p className="text-gray-500 text-sm">Meetings</p>
          <p className="text-2xl font-semibold">
            {analytics.meeting_booked}
          </p>
        </div>

        <div className="card">
          <p className="text-gray-500 text-sm">Conversion</p>
          <p className="text-2xl font-semibold">
            {analytics.conversion}%
          </p>
        </div>
      </div>
    </div>
  );
}
