import type { Lead } from "../../types";

interface Props {
  lead: Lead;
}

export default function LeadTimeLineTab({ lead }: Props) {
  return (
    <div className="p-6 space-y-4">
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
  <div className="bg-white border rounded-xl p-4">
    <p className="font-medium text-sm">{title}</p>
    <p className="text-sm text-gray-500">{desc}</p>
    <p className="text-xs text-gray-400 mt-1">
      {new Date(time).toLocaleString()}
    </p>
  </div>
);
