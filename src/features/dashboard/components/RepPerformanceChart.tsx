import type { RepPerformance } from "../types";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

interface Props {
  data: RepPerformance;
}

const COLORS = ["#6366F1", "#F59E0B", "#9CA3AF"];

export default function RepPerformanceChart({ data }: Props) {
  const chartData = [
    { name: "Top Performers", value: data.top_performer },
    { name: "Average", value: data.average },
    { name: "Needs Improvement", value: data.need_improvement }
  ];

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={chartData}
          innerRadius={60}
          outerRadius={80}
          dataKey="value"
        >
          {chartData.map((_, i) => (
            <Cell key={i} fill={COLORS[i]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
}
