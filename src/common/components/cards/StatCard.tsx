import React from "react";

interface Props {
  title: string;
  value: string | number;
  change?: string | number;          // e.g. +18.2%
  positive?: boolean;                // true → green ↑ , false → red ↓
  icon?: React.ReactNode;            // ICON AT TOP LEFT
}

export default function StatCard({ title, value, change, positive, icon }: Props) {
  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border flex flex-col gap-3">

      {/* TOP ROW → ICON + PROFIT/LOSS */}
      <div className="flex justify-between items-start">
        {/* Icon */}
        <div className="p-3 rounded-xl bg-purple-100 text-purple-600 text-xl">
          {icon}
        </div>

        {/* Profit / Loss */}
        {change !== undefined && (
          <span
            className={`text-sm font-semibold flex items-center gap-1 ${
              positive ? "text-green-600" : "text-red-600"
            }`}
          >
            {positive ? "↑" : "↓"} {change}
          </span>
        )}
      </div>

      {/* TITLE */}
      <p className="text-gray-500">{title}</p>

      {/* VALUE */}
      <h2 className="text-3xl font-bold">
        {typeof value === "number" ? value.toLocaleString() : value}
      </h2>
    </div>
  );
}
