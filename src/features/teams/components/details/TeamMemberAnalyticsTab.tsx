import { useEffect, useState, useRef } from "react";
import { useAppDispatch, useAppSelector } from "../../../../app/hooks";
import { fetchMemberAnalytics } from "../../slice";
import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";
import PipelineAreaChart from "../../../../common/components/cards/PipelineAreaChart";
import {
  Users,
  Clock,
  TrendingUp,
  MousePointerClick,
} from "lucide-react";
import { formatRupees } from "../../../../common/utils/ruppeeFormater";

/* ================= ICON COLOR MAP ================= */
export function formatINRCompact(value: number) {
  if (value >= 1_00_00_000) {
    return `${(value / 1_00_00_000).toFixed(1)}Cr`;
  }
  if (value >= 1_00_000) {
    return `${(value / 1_00_000).toFixed(1)}L`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K`;
  }
  return `${value}`;
}

export const formatAxis = (value: number): string => {
  if (value >= 1_00_00_000) return `${(value / 1_00_00_000).toFixed(1)}Cr`;
  if (value >= 1_00_000) return `${(value / 1_00_000).toFixed(1)}L`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toString(); // ✅ string
};


const iconColors = {
  green: {
    bg: "bg-green-50",
    border: "border-green-200",
    text: "text-green-600",
  },
  purple: {
    bg: "bg-purple-50",
    border: "border-purple-200",
    text: "text-purple-600",
  },
  orange: {
    bg: "bg-orange-50",
    border: "border-orange-200",
    text: "text-orange-600",
  },
  pink: {
    bg: "bg-pink-50",
    border: "border-pink-200",
    text: "text-pink-600",
  },
} as const;

type IconColor = keyof typeof iconColors;

/* ================= PAGE ================= */

export default function TeamMemberAnalyticsTab({
  memberId,
}: {
  memberId: number;
}) {
  const dispatch = useAppDispatch();
  const { analytics, analyticsLoading } = useAppSelector((s) => s.team);

  const [period, setPeriod] = useState<"day" | "week" | "month" | "year">(
    "month"
  );
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!dropdownRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    dispatch(
      fetchMemberAnalytics({
        id: memberId,
        pipeline_period: period === "day" ? "day" : period,
      })
    );
  }, [memberId, period, dispatch]);

  if (analyticsLoading)
    return <div className="p-10 text-gray-400">Loading analytics…</div>;

  if (!analytics?.analytics)
    return <div className="p-10 text-gray-400">No data</div>;

  const a = analytics.analytics;

  return (
    <div className="mt-6 space-y-10">
      {/* KPI */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <Kpi
          title="Total Leads"
          value={a.total_leads}
          icon={<Users size={22} />}
          color="purple"
        />

        <Kpi
          title="Pending Follow-ups"
          value={a.follow_ups_pending}
          icon={<Clock size={22} />}
          color="orange"
        />

        <Kpi
          title="Pipeline Value"
          value={`₹${formatINRCompact(a.pipeline_value)}`}
          icon={<TrendingUp size={22} />}
          color="green"
        />

        <Kpi
          title="Tap → Lead Ratio"
          value={`${a.tap_to_lead_ratio}%`}
          icon={<MousePointerClick size={22} />}
          color="pink"
        />
      </div>

      {/* PIPELINE TREND */}
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-gray-700">Pipeline Trend</h3>

          {/* CUSTOM DROPDOWN */}
          <div ref={dropdownRef} className="relative">
            <button
              onClick={() => setOpen((v) => !v)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border bg-gray-50 text-sm hover:bg-gray-100 transition"
            >
              <span>
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </span>

              <svg
                className={`w-4 h-4 transition ${open ? "rotate-180" : ""}`}
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            {open && (
              <div className="absolute right-0 mt-2 w-36 bg-white border rounded-xl shadow-lg z-50">
                {["day", "week", "month", "year"].map((p) => (
                  <button
                    key={p}
                    onClick={() => {
                      setPeriod(p as any);
                      setOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-purple-50 transition ${period === p
                      ? "text-purple-600 font-medium"
                      : "text-gray-600"
                      }`}
                  >
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <PipelineAreaChart
          data={a.pipeline_graph}
          period={period}  // or "day" | "week" | "month" | "year"
          color="#8b5cf6"
        />

      </div>

      {/* CAMPAIGN */}
      {a.campaign_contribution?.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h3 className="font-medium mb-3 text-gray-700">
            Campaign Contribution
          </h3>

          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={a.campaign_contribution}>
              <XAxis dataKey="campaign_name" />
              <YAxis tickFormatter={formatAxis} />
              <Tooltip
                formatter={(value: number | undefined) => [
                  `${(formatRupees(value) ?? 0).toLocaleString()}`,
                  "Amount",
                ]}
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid #e5e7eb",
                }}
              />

              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <Bar
                dataKey="value"
                fill="#8b5cf6"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

/* ================= KPI ================= */

function Kpi({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: any;
  icon: React.ReactNode;
  color: IconColor;
}) {
  const c = iconColors[color];
  return (
    <div className="relative h-[120px] rounded-2xl p-5 shadow-lg hover:shadow-xl transition bg-gradient-to-br from-slate-50 to-white overflow-hidden">
      <div className="flex h-full justify-between items-stretch gap-4">

        {/* LEFT */}
        <div className="flex flex-col justify-between min-w-0">
          <p className="text-sm text-gray-500 leading-tight">
            {title}
          </p>

          <p
            className="
    font-bold text-gray-900 leading-none
    text-[clamp(1.25rem,3.5vw,2.25rem)]
    whitespace-nowrap
  "
          >
            {value}
          </p>

        </div>

        {/* ICON */}
        <div
          className={`flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-xl shadow-sm 
          ${c.bg} ${c.border}`}
        >
          <span className={c.text}>{icon}</span>
        </div>
      </div>
    </div>
  );
}
