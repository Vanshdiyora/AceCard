import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export interface ChartPoint {
  label?: string; // day/hour/month label
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

  return Array.from({ length: 24 }, (_, h) => ({
    label: `${h.toString().padStart(2, "0")}:00`,
    value: h <= nowHour ? map.get(h) ?? null : null,
  }));
}

function buildWeek(data: ChartPoint[]): ChartPoint[] {
  const today = new Date().getDay(); // 0=Sun
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
  const currentMonth = new Date().getMonth(); // 0 = Jan

  const map = new Map<string, number>();
  data.forEach((d) => d.label && map.set(d.label, d.value as number));

  const months = [
    "Jan","Feb","Mar","Apr","May","Jun",
    "Jul","Aug","Sep","Oct","Nov","Dec",
  ];

  return months.map((month, index) => ({
    label: month,
    value:
      index <= currentMonth
        ? map.get(month) ?? null
        : null,
  }));
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
            interval="preserveStartEnd"
            tick={{ fill: "#9ca3af", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />

          <YAxis
            tick={{ fill: "#9ca3af", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />

          <Tooltip />

          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            fill="url(#pipelineGradient)"
            strokeWidth={2}
            dot={false}
            connectNulls={false} // 🔑 stops future line
            activeDot={{ r: 4 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
