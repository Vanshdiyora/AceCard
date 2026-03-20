import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../../app/hooks";
import { fetchLeadMeetings } from "../../slice";
import BrandLoader from "../../../../common/ui/BrandLoader";

interface Props {
  leadId: number;
}

export default function LeadFollowupsTab({ leadId }: Props) {
  const dispatch = useAppDispatch();
  const meetings = useAppSelector((s) => s.leads.meetings[leadId]);

  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    queueMicrotask(() => setIsFetching(true));
    dispatch(fetchLeadMeetings(leadId))
      .unwrap()
      .finally(() => setIsFetching(false));
  }, [dispatch, leadId]);

  if (isFetching) {
    return (
      <div className="flex items-center justify-center min-h-[350px]">
        <BrandLoader />
      </div>
    );
  }

  if (!meetings || meetings.length === 0) {
    return (
      <div className="p-6 text-sm text-gray-400 text-center">
        No followups yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {meetings.map((m) => (
        <FollowupItem key={m.id} meeting={m} />
      ))}
    </div>
  );
}


const FollowupItem = ({
  meeting,
}: {
  meeting: {
    id: number;
    title?: string;
    scheduled_at: string;
    duration_min?: number;
    location?: string;
    notes?: string;
    created_by: number;
    created_at: string;
  };
}) => {
  const date = new Date(meeting.scheduled_at);
  const isCompleted = date < new Date();

  return (
    <div className="bg-white border border-gray-100 rounded-2xl px-5 py-4 shadow-sm space-y-2">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <div className="text-sm font-semibold text-gray-900">
            {meeting.title || "Meeting"}
          </div>
          <div className="text-sm text-gray-600">
            {date.toLocaleDateString("en-IN", {
              weekday: "long",
              day: "2-digit",
              month: "short",
            })}{" "}
            •{" "}
            {date.toLocaleTimeString("en-IN", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>

        <span
          className={`text-xs font-semibold px-3 py-1 rounded-full ${
            isCompleted
              ? "bg-green-50 text-green-700"
              : "bg-purple-50 text-purple-700"
          }`}
        >
          {isCompleted ? "Completed" : "Scheduled"}
        </span>
      </div>

      {/* Meta */}
      <div className="grid grid-cols-1 gap-x-6 gap-y-1 text-sm text-gray-500">
        {meeting.duration_min && (
          <div>⏱ {meeting.duration_min} min</div>
        )}
        {/* {meeting.location && (
          <div>📍 {meeting.location}</div>
        )} */}
        <div>
          🗓 Created on{" "}
          {new Date(meeting.created_at).toLocaleDateString("en-IN")}
        </div>
      </div>

      {/* Notes */}
      {/* {meeting.notes && (
        <div className="text-xs text-gray-600 pt-1 border-t">
          {meeting.notes}
        </div>
      )} */}
    </div>
  );
};
