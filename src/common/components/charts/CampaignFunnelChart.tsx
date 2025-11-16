import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

export default function CampaignFunnelChart() {
  const data = [
    { name: "Card Taps", value: 480 },
    { name: "Leads", value: 240 },
    { name: "Qualified", value: 90 },
    { name: "Opportunities", value: 40 },
  ];

  return (
    <BarChart width={500} height={300} data={data} layout="vertical" margin={{ left: 40 }}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis type="number" />
       <YAxis
        type="category"
        dataKey="name"
        width={100}
      />
      <Tooltip />
      <Bar dataKey="value" fill="#8b5cf6" radius={[5, 5, 5, 5]} />
    </BarChart>
  );
}
