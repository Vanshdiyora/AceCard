import type { RatioPoint } from "../types";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer
} from "recharts";

interface Props {
  data: RatioPoint[];
}

export default function RatioLineChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={data}>
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="value" stroke="#7C3AED" strokeWidth={3} />
      </LineChart>
    </ResponsiveContainer>
  );
}
