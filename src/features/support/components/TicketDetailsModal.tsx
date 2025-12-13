import { X, MessageSquare } from "lucide-react";
import { useState } from "react";

export default function TicketDetailsModal({ open, onClose, ticket, onReply }: any) {
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState(ticket?.status || "open");

  if (!open || !ticket) return null;

  const handleSubmit = () => {
    onReply(ticket.id, message, status);
    setMessage("");
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl p-6 relative">

        {/* Close Button */}
        <button className="absolute top-3 right-3" onClick={onClose}>
          <X size={22} className="text-gray-500 hover:text-black" />
        </button>

        {/* Header */}
        <h2 className="text-xl font-bold mb-1">
          Ticket #{ticket.id}
        </h2>
        <p className="text-gray-600 mb-4">{ticket.subject}</p>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border">

          <div>
            <p className="text-xs text-gray-500">Vendor</p>
            <p className="font-medium">{ticket.vendorName}</p>
          </div>

          <div>
            <p className="text-xs text-gray-500">Contact Person</p>
            <p className="font-medium">{ticket.vendorContact}</p>
          </div>

          <div>
            <p className="text-xs text-gray-500">Issue Type</p>
            <span className="px-2 py-1 rounded-md text-xs bg-gray-200 inline-block">
              {ticket.category}
            </span>
          </div>

          <div>
            <p className="text-xs text-gray-500">Priority</p>
            <span
              className={`px-2 py-1 rounded-md text-xs
                ${
                  ticket.priority === "high"
                    ? "bg-red-100 text-red-600"
                    : ticket.priority === "medium"
                    ? "bg-yellow-100 text-yellow-600"
                    : "bg-blue-100 text-blue-600"
                }
              `}
            >
              {ticket.priority}
            </span>
          </div>

          <div>
            <p className="text-xs text-gray-500">Status</p>
            <span
              className={`px-2 py-1 rounded-md text-xs
              ${
                ticket.status === "open"
                  ? "bg-blue-100 text-blue-600"
                  : ticket.status === "pending"
                  ? "bg-yellow-100 text-yellow-600"
                  : "bg-green-100 text-green-600"
              }`}
            >
              {ticket.status}
            </span>
          </div>

          <div>
            <p className="text-xs text-gray-500">Assigned To</p>
            <p className="font-medium">{ticket.assigned_to || "—"}</p>
          </div>

          <div>
            <p className="text-xs text-gray-500">Created</p>
            <p className="font-medium">{ticket.created_at}</p>
          </div>

          <div>
            <p className="text-xs text-gray-500">Last Update</p>
            <p className="font-medium">{ticket.updated_at}</p>
          </div>
        </div>

        {/* Description */}
        <div className="mt-5">
          <p className="font-medium mb-1">Description</p>
          <div className="bg-gray-50 border rounded-xl p-3 text-gray-700">
            {ticket.description || "No details provided."}
          </div>
        </div>

        {/* Response Box */}
        <div className="mt-6">
          <p className="font-medium mb-1">Your Response</p>
          <textarea
            className="w-full border rounded-lg p-3 h-24"
            placeholder="Type your response..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />

          {/* Status Dropdown */}
          <select
            className="mt-3 border rounded-lg px-3 py-2 text-sm"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="open">Open</option>
            <option value="pending">Pending</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        {/* Buttons */}
        <div className="flex justify-end mt-6 gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded-lg"
          >
            Close
          </button>

          <button
            onClick={handleSubmit}
            className="px-5 py-2 bg-purple-600 text-white rounded-lg flex items-center gap-2"
          >
            <MessageSquare size={16} />
            Send Response
          </button>
        </div>
      </div>
    </div>
  );
}
