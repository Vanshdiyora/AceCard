import { PieChart, Pie, Cell } from "recharts";
import { useAppSelector } from "../../../app/hooks";

export default function PieLeadChart() {
  const data = useAppSelector((s) => s.dashboard.leadDistribution);
  const colors = ["#8b5cf6", "#6366f1", "#a78bfa"];

  return (
    <PieChart width={350} height={250}>
      <Pie data={data} dataKey="value" innerRadius={60} outerRadius={80}>
        {data.map((_, i) => (
          <Cell key={i} fill={colors[i]} />
        ))}
      </Pie>
    </PieChart>
  );
}
