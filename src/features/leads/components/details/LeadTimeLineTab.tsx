import type { Lead } from "../../types";
import { Clock } from "lucide-react";

interface Props {
  lead: Lead;
}

export default function LeadTimeLineTab({ lead }: Props) {
  return (
    <div className="relative pl-6 space-y-8">
      {/* Vertical line */}
      <div className="absolute left-2 top-0 bottom-0 w-px bg-gradient-to-b from-purple-200 via-purple-100 to-transparent" />

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

const TimelineItem = ({ title, desc, time }: any) => (
  <div className="relative flex gap-5 items-start">

    {/* Card */}
    <div className="
      flex-1 bg-white rounded-2xl border border-gray-100
      px-5 py-4 shadow-sm hover:shadow-md transition
    ">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-gray-900">{title}</p>
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <Clock size={12} />
          {new Date(time).toLocaleString()}
        </div>
      </div>

      <p className="text-sm text-gray-500 mt-1">{desc}</p>
    </div>
  </div>
);
