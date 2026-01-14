import { Trash2 } from "lucide-react";
import DOMPurify from "dompurify";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { markRead, archiveNotification } from "../slice";
import BlockerLoader from "../../../common/ui/BlockingLoader";

export default function NotificationItem({ item }: any) {
  const dispatch = useAppDispatch();
  const isUnread = item.status === "sent";
  const archiving = useAppSelector((s) => s.notifications.archiving);

  const handleArchive = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(archiveNotification(item.id));
  };

  const safeHtml = DOMPurify.sanitize(item.message_body);

  return (
    <div
      onClick={() => isUnread && dispatch(markRead(item.id))}
      className={`p-3 border rounded-md cursor-pointer relative group transition
        ${isUnread ? "bg-blue-50 border-blue-200" : "bg-white"}`}
    >
      <BlockerLoader show={archiving} />

      <button
        onClick={handleArchive}
        className="absolute top-2 right-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100"
        title="Archive"
      >
        <Trash2 size={16} />
      </button>

      <h4 className="text-sm font-semibold">{item.message_title}</h4>

      {/* Render HTML safely */}
      <div
        className="text-sm text-gray-600 prose prose-sm max-w-none"
        dangerouslySetInnerHTML={{ __html: safeHtml }}
      />

      <span className="text-xs text-gray-400">
        {new Date(item.created_at).toLocaleString()}
      </span>
    </div>
  );
}
