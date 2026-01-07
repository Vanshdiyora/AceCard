import React from "react";

interface StatItem {
  title: string;
  value: string | number;
  change?: string | number;
  positive?: boolean;
  icon?: React.ReactNode;
}

interface Props {
  items: StatItem[];
}

export default function StatsRow({ items }: Props) {
  return (
    <div
  className="bg-white rounded-2xl border px-16 py-2"
  style={{ boxShadow: "5px 3px 14.6px 0px #2D1A5340" }}
>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 items-center">
        {items.map((item, index) => (
          <React.Fragment key={index}>
            {/* Stat */}
            <div className="flex flex-col gap-2 py-3">
              {/* Icon + title */}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-purple-300 text-purple-700 flex items-center justify-center shrink-0">
                  {item.icon}
                </div>
                <span className="text-sm font-medium text-gray-800">
                  {item.title}
                </span>
              </div>

              {/* Value row */}
              <div className="flex items-center gap-2 ml-12">
                <span className="text-3xl font-semibold text-[#1e145f]">
                  {typeof item.value === "number"
                    ? item.value.toLocaleString()
                    : item.value}
                </span>

                {item.change && (
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      item.positive !== false
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    +{item.change}
                  </span>
                )}
              </div>
            </div>

            {/* Divider — only on large screens & not last */}
            {index < items.length - 1 && (
              <div className="hidden lg:flex justify-center">
                <div className="w-px h-12 bg-purple-200 opacity-80" />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
