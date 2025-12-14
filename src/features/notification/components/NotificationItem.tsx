import { Trash2 } from "lucide-react";
import { useAppDispatch } from "../../../app/hooks";
import { markRead, markUnread, deleteNotification } from "../slice";
// import { useNavigate } from "react-router-dom";

export default function NotificationItem({ item }: any) {
  const dispatch = useAppDispatch();
  // const navigate = useNavigate();

  const openFlow = () => {
    dispatch(markRead(item.id));

    // Optional navigation depending on type
    switch (item.source) {
      case "admin_vendor":
        // No navigation required unless you want something specific
        break;
    }
  };

  // Format date (simple)
  const formattedDate = new Date(item.created_at).toLocaleString();

  return (
    <div
      className={`p-3 border rounded-md hover:bg-gray-50 cursor-pointer relative group ${
        item.status !== "read" ? "bg-blue-50 border-blue-200" : "bg-white"
      }`}
      onClick={openFlow}
    >
      {/* Title */}
      <h4 className={`font-medium ${item.status !== "read" && "font-bold"}`}>
        {item.message_title}
      </h4>

      {/* Message Body */}
      <p className="text-sm text-gray-600">{item.message_body}</p>

      {/* Created date */}
      <span className="text-xs text-gray-400">{formattedDate}</span>

      {/* Hover actions */}
      <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100">
        {item.status === "read" ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              dispatch(markUnread(item.id));
            }}
            className="text-xs text-blue-600"
          >
            Unread
          </button>
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation();
              dispatch(markRead(item.id));
            }}
            className="text-xs text-blue-600"
          >
            Read
          </button>
        )}

        <Trash2
          className="w-4 h-4 text-red-500 hover:text-red-700"
          onClick={(e) => {
            e.stopPropagation();
            dispatch(deleteNotification(item.id));
          }}
        />
      </div>
    </div>
  );
}
