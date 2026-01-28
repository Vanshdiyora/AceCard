export default function SeatUsageBar({
  used,
  total,
}: {
  used: number;
  total: number;
}) {
  const percentage = Math.min((used / total) * 100, 100);

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-purple-100 bg-gradient-to-br from-white to-purple-50 px-4 py-0.5 shadow-sm">
      {/* Label */}
      <div className="flex flex-col leading-tight">
        <span className="text-[11px] uppercase tracking-wide text-gray-500">
          Seats
        </span>
        <span className="text-sm font-semibold text-gray-800">
          {used}
          <span className="text-gray-400 font-medium"> / {total}</span>
        </span>
      </div>

      {/* Progress */}
      <div className="relative w-[120px] h-2 rounded-full bg-purple-100 overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-purple-500 to-fuchsia-500 transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
