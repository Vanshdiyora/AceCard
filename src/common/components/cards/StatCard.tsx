interface Props {
  title: string;
  value: string | number;   // <– FIXED
  change: string | number;  // <– also allow number
  positive?: boolean;
}

export default function StatCard({ title, value, change, positive }: Props) {
  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border">
      <p className="text-gray-500">{title}</p>

      <h2 className="text-3xl font-semibold mt-1">
        {typeof value === "number" ? value.toLocaleString() : value}
      </h2>

      <p
        className={`mt-1 text-sm ${
          positive ? "text-green-600" : "text-red-600"
        }`}
      >
        {positive ? "↑" : "↓"} {change} vs last month
      </p>
    </div>
  );
}
