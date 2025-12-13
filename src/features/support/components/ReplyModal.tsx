import { useState } from "react";
import { useAppDispatch } from "../../../app/hooks";
import { replyTicket } from "../slice";

export default function ReplyModal({ open, onClose, ticket }: any) {
  const dispatch = useAppDispatch();
  const [message, setMessage] = useState("");

  if (!open || !ticket) return null;

  const handleSubmit = async () => {
    await dispatch(replyTicket({ ticketId: ticket.id, message }));
    onClose();
    setMessage("");
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-xl w-96 shadow-lg">
        <h2 className="font-semibold text-lg mb-3">
          Reply to Ticket #{ticket.id}
        </h2>

        <textarea
          className="w-full border rounded-lg p-3 h-32"
          placeholder="Type your reply..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />

        <div className="flex justify-end mt-4 gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg"
          >
            Send Reply
          </button>
        </div>
      </div>
    </div>
  );
}
