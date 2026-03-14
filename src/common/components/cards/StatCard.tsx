import React from "react";

type Theme = "green" | "red" | "blue" | "orange" | "purple";

interface Props {
  title: string;
  value: string | number;
  change?: number | string;
  positive?: boolean;
  icon?: React.ReactNode;
  color?: Theme;
  period?: "today" | "week" | "month" | "year";
}
const periodLabelMap = {
  today: "vs. prior day",
  week: "vs. prior week",
  month: "vs. prior month",
  year: "vs. prior year",
};

const colorMap = {
  green: {
    text: "text-green-600",
    ring: "ring-green-300",
    bg: "bg-green-100",
  },
  red: {
    text: "text-red-600",
    ring: "ring-red-300",
    bg: "bg-red-100",
  },
  blue: {
    text: "text-blue-600",
    ring: "ring-blue-300",
    bg: "bg-blue-100",
  },
  orange: {
    text: "text-orange-600",
    ring: "ring-orange-300",
    bg: "bg-orange-100",
  },
  purple: {
    text: "text-purple-600",
    ring: "ring-purple-300",
    bg: "bg-purple-100",
  },
};

export default function StatCard({
  title,
  value,
  change,
  positive,
  icon,
  color = "blue",
  period
}: Props) {
  const percent = Number(change ?? 0);

  return (
    <div className="group relative bg-white/80 backdrop-blur p-5 rounded-2xl border shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 flex flex-col h-full">
      
      {/* TOP CONTENT */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div
            className={`inline-flex p-2.5 rounded-xl shadow-sm ring-1 ${colorMap[color].ring} ${colorMap[color].bg}`}
          >
            <span className={colorMap[color].text}>{icon}</span>
          </div>

          <p className="text-sm text-gray-500">{title}</p>

          <h2 className="text-3xl font-semibold tracking-tight">
            {typeof value === "number" ? value.toLocaleString() : value}
          </h2>
        </div>
      </div>

      {/* CHANGE INDICATOR - BOTTOM */}
      {change !== undefined && (
        <div className="flex items-center gap-1 text-sm mt-auto pt-4">
          <span
            className={`text-xs ${positive ? "text-green-600" : "text-red-600"
              }`}
          >
            {positive ? "▲" : "▼"}
          </span>

          <span
            className={`font-medium ${positive ? "text-green-600" : "text-red-600"
              }`}
          >
            {percent}%
          </span>

          <span className="text-gray-400">
            {periodLabelMap[period ?? "month"]}
          </span>
        </div>
      )}
    </div>
  );
}