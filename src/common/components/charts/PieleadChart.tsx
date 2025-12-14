import { PieChart, Pie, Cell } from "recharts";
import { useAppSelector } from "../../../app/hooks";

export default function PieLeadChart() {
  const rawData = useAppSelector((s) => s.dashboard.data?.tap_lead_ratio_over_time) || [];
  const data = (rawData.length > 0 ? rawData : [{ month: "Jan", value: 0 }]) as any[];
  const colors = ["#8b5cf6", "#6366f1", "#a78bfa"];

  return (
    <PieChart width={350} height={250}>
      <Pie data={data} dataKey="value" innerRadius={60} outerRadius={80}>
        {data.map((_: any, i: number) => (
          <Cell key={i} fill={colors[i % colors.length]} />
        ))}
      </Pie>
    </PieChart>
  );
}
