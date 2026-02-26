import type { RecentActivityEntry } from "../types";

interface Props {
  items?: RecentActivityEntry[] | null;
}

export default function RecentActivity({ items }: Props) {
  // ✅ Filter only last 24 hours
  const last24HoursItems =
    items?.filter((i) => {
      const createdAt = new Date(i.created_at).getTime();
      const now = Date.now();
      return now - createdAt <= 24 * 60 * 60 * 1000;
    }) ?? [];

  if (!last24HoursItems || last24HoursItems.length === 0) {
    return (
      <div
        className="bg-white rounded-2xl border px-6 py-5 text-center text-sm text-gray-500"
        style={{ boxShadow: "2px 2px 3px 0px #2D1A5340" }}
      >
        <h3 className="font-semibold text-[#2d1a53] mb-4">Recent Activity</h3>
        No recent activity
      </div>
    );
  }

  return (
    <div
      className="bg-white rounded-2xl border px-6 py-5"
      style={{ boxShadow: "2px 2px 3px 0px #2D1A5340" }}
    >
      <h3 className="font-semibold text-[#2d1a53] mb-4">Recent Activity</h3>

      <div className="max-h-[475px] overflow-y-auto divide-y divide-purple-100 pr-2">
        {last24HoursItems.map((i, idx) => (
          <div key={idx} className="relative flex items-center py-4">
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

            {/* Center tag */}
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
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
}
