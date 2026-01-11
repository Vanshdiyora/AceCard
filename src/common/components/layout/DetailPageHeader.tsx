import type { ReactNode } from "react";

type StatusVariant = "active" | "inactive" | "archived" | "suspended";

interface DetailPageHeaderProps {
  title: string;
  subtitle?: string;
  status?: {
    label: string;
    variant: StatusVariant;
  };
  avatar?: ReactNode;
  actions?: ReactNode;
}

const statusStyles: Record<StatusVariant, string> = {
  active: "bg-green-100 text-green-700",
  inactive: "bg-gray-200 text-gray-600",
  archived: "bg-gray-300 text-gray-700",
  suspended: "bg-red-100 text-red-600",
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
        {/* Avatar */}
        {avatar && (
          <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-semibold text-lg shrink-0">
            {avatar}
          </div>
        )}

        {/* Title block */}
        <div className="min-w-0">
          <h2 className="text-xl font-semibold leading-tight truncate">{title}</h2>
          <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
            {subtitle && <span className="truncate">{subtitle}</span>}
            {status && (
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusStyles[status.variant]}`}
              >
                {status.label}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right actions */}
      {actions && <div className="flex items-center gap-4">{actions}</div>}
    </div>
  );
}
