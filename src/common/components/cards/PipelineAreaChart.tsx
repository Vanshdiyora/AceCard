import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { formatAxis } from "../../../features/teams/components/details/TeamMemberAnalyticsTab";

/* -----------------------------------------------------
   TYPES
----------------------------------------------------- */

export interface ChartPoint {
  label?: string;
  value: number | null;
}

interface Props {
  data: ChartPoint[];
  period: "day" | "week" | "month" | "year";
  color?: string;
}

/* -----------------------------------------------------
   BUILDERS
----------------------------------------------------- */

function buildDay(data: ChartPoint[]): ChartPoint[] {
  const nowHour = new Date().getHours();
  const map = new Map<number, number>();

  data.forEach((d) => {
    if (!d.label) return;
    map.set(Number(d.label.split(":")[0]), d.value as number);
  });

  const STEP = 4;

  return Array.from({ length: Math.ceil(24 / STEP) }, (_, i) => {
    const hour = i * STEP;

    return {
      label: `${hour.toString().padStart(2, "0")}:00`,
      value: hour <= nowHour ? map.get(hour) ?? null : null,
    };
  });
}

function buildWeek(data: ChartPoint[]): ChartPoint[] {
  const today = new Date().getDay(); // 0 = Sun
  const map = new Map<string, number>();

  data.forEach((d) => d.label && map.set(d.label, d.value as number));

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return days.map((day, i) => ({
    label: day,
    value: i <= today ? map.get(day) ?? null : null,
  }));
}

function buildMonth(data: ChartPoint[]): ChartPoint[] {
  const now = new Date();
  const today = now.getDate();
  const monthIndex = now.getMonth();
  const year = now.getFullYear();

  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const monthName = now.toLocaleString("en-US", { month: "short" });

  const map = new Map<string, number>();
  data.forEach((d) => d.label && map.set(d.label, d.value as number));

  return Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    const label = `${day.toString().padStart(2, "0")} ${monthName}`;

    return {
      label,
      value: day <= today ? map.get(label) ?? null : null,
    };
  });
}

function buildYear(data: ChartPoint[]): ChartPoint[] {
  const currentMonth = new Date().getMonth();
  const map = new Map<string, number>();

  data.forEach((d) => d.label && map.set(d.label, d.value as number));

  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  return months.map((month, index) => ({
    label: month,
    value: index <= currentMonth ? map.get(month) ?? null : null,
  }));
}

/* -----------------------------------------------------
   HELPERS
----------------------------------------------------- */

// ONLY ticks we want for month view: 1st, 8th, 15th...
function getMonthlyTicks(data: ChartPoint[]): string[] {
  return data
    .filter((d): d is { label: string; value: number | null } => {
      if (!d.label) return false;
      const day = Number(d.label.split(" ")[0]);
      return day === 1 || (day - 1) % 7 === 0;
    })
    .map((d) => d.label);
}

/* -----------------------------------------------------
   COMPONENT
----------------------------------------------------- */

export default function PipelineAreaChart({
  data,
  period,
  color = "#a855f7",
}: Props) {
  let finalData: ChartPoint[] = [];

  switch (period) {
    case "day":
      finalData = buildDay(data);
      break;
    case "week":
      finalData = buildWeek(data);
      break;
    case "month":
      finalData = buildMonth(data);
      break;
    case "year":
      finalData = buildYear(data);
      break;
  }

  const monthTicks =
    period === "month" ? getMonthlyTicks(finalData) : undefined;

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={finalData}>
          <defs>
            <linearGradient id="pipelineGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.35} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="4 4" stroke="#e5e7eb" />

          <XAxis
            dataKey="label"
            ticks={monthTicks}
            tick={{ fill: "#9ca3af", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />

          <YAxis
            tick={{ fill: "#9ca3af", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={formatAxis}
          />

          <Tooltip
            formatter={(value: number | undefined) => [
              `₹${(value ?? 0).toLocaleString()}`,
              "Amount",
            ]}
            contentStyle={{
              borderRadius: "12px",
              border: "1px solid #e5e7eb",
            }}
          />


          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            fill="url(#pipelineGradient)"
            strokeWidth={2}
            dot={false}
            connectNulls={false}
            activeDot={{ r: 4 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
