import React from "react";

type Theme = "green" | "red" | "blue" | "orange" | "purple";

interface Props {
  title: string;
  value: string | number;
  change?: number | string;
  positive?: boolean;
  icon?: React.ReactNode;
  color?: Theme;
}

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
}: Props) {
  const percent =
    typeof change === "number"
      ? Math.min(Math.abs(change), 100)
      : 0;

  // const strokeDash = 2 * Math.PI * 20;
  // const dashOffset = strokeDash - (strokeDash * percent) / 100;

  return (
    <div className="group relative bg-white/80 backdrop-blur p-5 rounded-2xl border shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
      <div className="flex items-center justify-between">
        {/* LEFT */}
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

        {/* RIGHT - PROGRESS */}
        {change !== undefined && (
          <div className="relative w-20 h-20">
            <svg className="w-full h-full rotate-[-90deg]">
              <circle
                cx="40"
                cy="40"
                r="30"
                stroke="#E5E7EB"
                strokeWidth="5"
                fill="none"
              />
              <circle
                cx="40"
                cy="40"
                r="30"
                stroke={positive ? "#16A34A" : "#DC2626"}
                strokeWidth="5"
                fill="none"
                strokeDasharray={2 * Math.PI * 30}
                strokeDashoffset={
                  2 * Math.PI * 30 -
                  ((2 * Math.PI * 30) * percent) / 100
                }
                strokeLinecap="round"
              />
            </svg>

            <span
              className={`absolute inset-0 flex items-center justify-center text-base ${positive ? "text-green-600" : "text-red-600"
                }`}
            >
              {percent}%
            </span>
          </div>
        )}

      </div>
    </div>
  );
}
