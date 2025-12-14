import { useAppSelector } from "../../../app/hooks";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

export default function PipelineChart() {
  const data = useAppSelector((s) => s.dashboard.data?.tap_lead_ratio_over_time) || [];

  return (
    <LineChart width={500} height={250} data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="month" />
      <YAxis />
      <Tooltip />
      <Line type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={3} />
    </LineChart>
  );
}
