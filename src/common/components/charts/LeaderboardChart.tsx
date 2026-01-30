export default function LeaderboardChart() {
  const ranking = [
    { name: "Sarah J.", leads: 89, pipeline: "₹245k" },
    { name: "Michael C.", leads: 76, pipeline: "₹198k" },
    { name: "David R.", leads: 94, pipeline: "₹215k" },
    { name: "Emily W.", leads: 83, pipeline: "₹190k" },
  ];

  return (
    <div className="space-y-3">
      {ranking.map((r, index) => (
        <div key={index} className="flex items-center gap-4">
          <span className="w-7 h-7 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-xs font-semibold">
            {index + 1}
          </span>

          <div className="flex-1">
            <p className="font-medium">{r.name}</p>
            <p className="text-xs text-gray-500">
              {r.leads} leads • {r.pipeline} pipeline
            </p>
          </div>

          <span className="text-green-500 text-sm">↑</span>
        </div>
      ))}
    </div>
  );
}
