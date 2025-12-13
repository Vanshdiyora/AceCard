import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function ProductAnalyticsChart({ products }: any) {
  const data = products.map((p: any) => ({
    name: p.name,
    leads: p.extra_properties?.Leads || 0,
    opp: p.extra_properties?.Opportunities || 0
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="leads" fill="#8b5cf6" />
        <Bar dataKey="opp" fill="#f59e0b" />
      </BarChart>
    </ResponsiveContainer>
  );
}
