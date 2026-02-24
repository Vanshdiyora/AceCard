import type { ReactNode } from "react";

/* ✅ Allow any string status */
interface DetailPageHeaderProps {
  title: string;
  subtitle?: string;
  status?: {
    label: string;
  };
  avatar?: ReactNode;
  actions?: ReactNode;
}

/* ✅ Full status color mapping (same as table) */
const statusStyles: Record<string, string> = {
  planned: "bg-blue-100 text-blue-700 border-blue-200",
  draft: "bg-purple-100 text-purple-700 border-purple-200",
  active: "bg-green-100 text-green-700 border-green-200",
  paused: "bg-yellow-100 text-yellow-700 border-yellow-200",
  archived: "bg-gray-100 text-gray-700 border-gray-200",
  completed: "bg-emerald-100 text-emerald-700 border-emerald-200",
  expired: "bg-red-100 text-red-700 border-red-200",
};

export default function DetailPageHeader({
  title,
  subtitle,
  status,
  avatar,
  actions,
}: DetailPageHeaderProps) {
  return (
    <div className="bg-white rounded-2xl border p-6 flex items-center justify-between gap-4">

      {/* Left */}
      <div className="flex items-center gap-4 min-w-0">

        {avatar && <div className="shrink-0">{avatar}</div>}

        <div className="min-w-0">
          <h2 className="text-xl font-semibold leading-snug break-words">
            {title}
          </h2>

          <div className="flex items-center gap-3 mt-2 flex-wrap">
            {subtitle && (
              <span className="text-sm text-gray-600 leading-none break-all">
                {subtitle}
              </span>
            )}

            {status && (
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border leading-none ${statusStyles[status.label.toLowerCase()] ||
                  "bg-gray-100 text-gray-700 border-gray-200"
                  }`}
              >
                {status.label.charAt(0).toUpperCase() +
                  status.label.slice(1)}
              </span>
            )}
          </div>

        </div>
      </div>

      {/* Right */}
      {actions && <div className="flex items-center gap-4">{actions}</div>}
    </div>
  );
}
