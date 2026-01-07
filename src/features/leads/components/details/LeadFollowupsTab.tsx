export default function LeadFollowupsTab() {
  return (
    <div className="space-y-6">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
        Follow-ups
      </h3>

      <div className="space-y-4">
        <FollowupItem
          date="Friday, 20 Sep"
          title="Follow up on proposal discussion"
          status="Scheduled"
        />

        <FollowupItem
          date="Monday, 16 Sep"
          title="Initial discovery follow-up"
          status="Completed"
        />
      </div>
    </div>
  );
}

const FollowupItem = ({
  date,
  title,
  status,
}: {
  date: string;
  title: string;
  status: "Scheduled" | "Completed";
}) => {
  const isCompleted = status === "Completed";

  return (
    <div className="
      flex items-start justify-between gap-4
      bg-white border border-gray-100 rounded-2xl
      px-5 py-4 shadow-sm hover:shadow-md transition
    ">
      <div className="flex flex-col">
        <span className="text-xs text-gray-400">{date}</span>
        <span className="text-sm font-semibold text-gray-900">{title}</span>
      </div>

      <span
        className={`
          text-xs font-semibold px-3 py-1 rounded-full
          ${isCompleted
            ? "bg-green-50 text-green-700"
            : "bg-purple-50 text-purple-700"}
        `}
      >
        {status}
      </span>
    </div>
  );
};
