import React from "react";

interface Props {
  title: string;
  value: string | number;
  change?: string | number;
  positive?: boolean;
  icon?: React.ReactNode;
}

export default function StatCard({ title, value, change, positive, icon }: Props) {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border flex flex-col gap-2">

      {/* TOP ROW */}
      <div className="flex justify-between items-start">
        {/* Icon */}
        <div className="p-2 rounded-lg bg-purple-100 text-purple-600 text-base">
          {icon}
        </div>

        {/* Profit / Loss */}
        {change !== undefined && (
          <span
            className={`text-xs font-semibold flex items-center gap-0.5 ${
              positive ? "text-green-600" : "text-red-600"
            }`}
          >
            {positive ? "↑" : "↓"} {change}
          </span>
        )}
      </div>

      {/* TITLE */}
      <p className="text-gray-500 text-sm">{title}</p>

      {/* VALUE */}
      <h2 className="text-2xl font-bold leading-tight">
        {typeof value === "number" ? value.toLocaleString() : value}
      </h2>
    </div>
  );
}
