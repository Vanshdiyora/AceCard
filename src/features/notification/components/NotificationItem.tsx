import { useAppDispatch } from "../../../app/hooks";
import { markRead } from "../slice";

interface NotificationItemProps {
  item: {
    id: number;
    message_title: string;
    message_body: string;
    created_at: string;
    status: "sent" | "read";
  };
}

export default function NotificationItem({ item }: NotificationItemProps) {
  const dispatch = useAppDispatch();

  // unread = status === "sent"
  const isUnread = item.status === "sent";

  const handleClick = () => {
    if (isUnread) {
      dispatch(markRead(item.id)); // ✅ mark as read
    }
  };

  const formattedDate = new Date(item.created_at).toLocaleString();

  return (
    <div
      onClick={handleClick}
      className={`p-3 border rounded-md cursor-pointer relative group transition
        ${isUnread ? "bg-blue-50 border-blue-200" : "bg-white"}`}
    >
      {/* Title */}
      <h4
        className={`text-sm ${
          isUnread ? "font-semibold" : "font-medium"
        }`}
      >
        {item.message_title}
      </h4>

      {/* Body */}
      <p className="text-sm text-gray-600">
        {item.message_body}
      </p>

      {/* Date */}
      <span className="text-xs text-gray-400">
        {formattedDate}
      </span>
    </div>
  );
}
