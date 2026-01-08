import type { Lead } from "../../types";
import { Clock } from "lucide-react";

interface Props {
  lead: Lead;
}

export default function LeadTimeLineTab({ lead }: Props) {
  return (
    <div className="relative space-y-4">
      {/* Vertical line */}
      <div className="absolute left-3 top-0 bottom-0 w-px bg-gray-200" />

      <TimelineItem
        title="Lead Created"
        desc="Lead was added to the system"
        time={lead.created_at}
      />

      <TimelineItem
        title="Last Interaction"
        desc="Most recent activity"
        time={lead.last_interaction_at}
      />
    </div>
  );
}

const TimelineItem = ({
  title,
  desc,
  time,
}: {
  title: string;
  desc: string;
  time: string;
}) => (
  <div className="relative flex gap-4 items-start">
    {/* Card */}
    <div
      className="
        flex-1 bg-white border border-gray-100 rounded-2xl
        px-5 py-4 shadow-sm hover:shadow-md transition
      "
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-semibold text-gray-900">
          {title}
        </span>
        <span className="flex items-center gap-1 text-xs text-gray-400">
          <Clock size={12} />
          {new Date(time).toLocaleString()}
        </span>
      </div>

      <p className="text-sm text-gray-600 leading-relaxed">
        {desc}
      </p>
    </div>
  </div>
);
