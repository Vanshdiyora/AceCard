import React from "react";
import StatCard from "./StatCard"; // update path if needed

interface StatItem {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  change?: string | number;
  positive?: boolean;
}

interface Props {
  items: StatItem[];
}

export default function StatsGrid({ items }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {items.map((item, idx) => (
        <StatCard
          key={idx}
          title={item.title}
          value={item.value}
          icon={item.icon}
          change={item.change}
          positive={item.positive}
        />
      ))}
    </div>
  );
}
