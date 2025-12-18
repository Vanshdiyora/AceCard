import type { RecentActivityEntry } from "../types";

interface Props {
  items: RecentActivityEntry[];
}

export default function RecentActivity({ items }: Props) {
  return (
    <div className="bg-white p-6 rounded-xl shadow border">
      <h3 className="font-semibold mb-4">Recent Activity</h3>

      <div className="space-y-3">
        {items && items.map((i, idx) => (
          <div key={idx} className="p-3 rounded-lg border bg-gray-50">
            <p className="font-medium">{i.title}</p>
            <p className="text-sm text-gray-600">{i.name}</p>
            <p className="text-xs text-gray-400">
              {new Date(i.created_at).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
