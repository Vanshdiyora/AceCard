interface Props {
  percent: number;
}

export default function UtilizationBar({ percent }: Props) {
  const percentValue = Math.min(100, Math.max(0, percent)); // clamp

  const color =
    percentValue >= 90
      ? "text-red-600"
      : percentValue <= 40
      ? "text-green-600"
      : "text-orange-500";

  return (
    <div className="flex items-center gap-2">
      {/* Bar container */}
      <div className="w-8 h-2 bg-gray-300 rounded-full overflow-hidden">
        {/* Bar fill */}
        <div
          className="h-full bg-black rounded-full"
          style={{ width: `${percentValue}%` }}
        ></div>
      </div>

      {/* Percentage text */}
      <span className={`text-sm font-medium ${color}`}>
        {percentValue}%
      </span>
    </div>
  );
}
