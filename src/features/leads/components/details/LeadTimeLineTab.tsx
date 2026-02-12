import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../../../app/hooks";
import { fetchLeadTimeline } from "../../slice";
import { Clock } from "lucide-react";
import BrandLoader from "../../../../common/ui/BrandLoader";

interface Props {
  leadId: number;
}

export default function LeadTimeLineTab({ leadId }: Props) {
  const dispatch = useAppDispatch();
  const timeline = useAppSelector((s) => s.leads.timeline[leadId]);
  const loading = useAppSelector((s) => s.leads.loading);

  useEffect(() => {
    dispatch(fetchLeadTimeline(leadId));
  }, [dispatch, leadId]);

  // ✅ While loading → show ONLY loader, nothing else
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[350px]">
        <BrandLoader />
      </div>
    );
  }

  // ✅ After loading, but no data
  if (!timeline || timeline.length === 0) {
    return (
      <div className="p-6 text-sm text-gray-400 text-center">
        No activity yet.
      </div>
    );
  }

  return (
    <div className="relative min-h-[200px]">
      <div className="absolute left-5 top-0 bottom-0 w-px bg-gray-200" />
      <div className="relative space-y-6">
        {timeline.map((item) => (
          <TimelineItem key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}

function TimelineItem({ item }: { item: any }) {
  return (
    <div className="relative flex gap-4">
      <div className="flex-1 bg-white border border-gray-100 rounded-2xl px-5 py-4 shadow-sm">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-semibold text-gray-900">
            {item.title}
          </span>
          <span className="flex items-center gap-1 text-sm text-gray-600">
            <Clock size={12} />
            {new Date(item.timestamp).toLocaleString()}
          </span>
        </div>

        <p className="text-sm text-gray-600">{item.description}</p>

        {item.actor && (
          <p className="mt-1 text-xs text-gray-400">by {item.actor}</p>
        )}
      </div>
    </div>
  );
}
