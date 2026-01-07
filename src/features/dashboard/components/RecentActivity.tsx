import type { RecentActivityEntry } from "../types";

interface Props {
  items: RecentActivityEntry[];
}

export default function RecentActivity({ items }: Props) {
  return (
    <div
      className="bg-white rounded-2xl border px-6 py-5"
      style={{ boxShadow: "5px 3px 14.6px 0px #2D1A5340" }}
    >
      <h3 className="font-semibold text-[#2d1a53] mb-4">Recent Activity</h3>

      <div className="divide-y divide-purple-100">
        {items.map((i, idx) => (
          <div
            key={idx}
            className="relative flex items-center py-4"
          >
            {/* Left */}
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-gray-300" />
              <div>
                <p className="font-medium text-[#2d1a53] leading-tight">
                  {i.title}
                </p>
                <p className="text-sm text-gray-500 leading-tight">
                  {i.name}
                </p>
              </div>
            </div>

            {/* Center tag — absolutely centered */}
            {i.type && (
              <div className="absolute left-1/2 -translate-x-1/2">
                <span className="text-xs font-semibold px-4 py-1 rounded-full bg-purple-200 text-purple-700">
                  {i.type}
                </span>
              </div>
            )}

            {/* Right */}
            <div className="ml-auto text-sm text-gray-500 whitespace-nowrap">
              {formatTimeAgo(i.created_at)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function formatTimeAgo(dateString: string) {
  const diff = Date.now() - new Date(dateString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} Min. ago`;
  const hours = Math.floor(mins / 60);
  return `${hours} hour ago`;
}
