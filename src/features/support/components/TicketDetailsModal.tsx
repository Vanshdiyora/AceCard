import { X, MessageSquare } from "lucide-react";
import { useEffect, useState } from "react";
import { formatDate } from "../pages/SupportAdmin";

type TicketStatus = "open" | "pending" | "closed";

interface Props {
  open: boolean;
  onClose: () => void;
  ticket: any;
  onReply: (ticketId: number, message: string, status: TicketStatus) => void;
}

/* -------- Helpers -------- */

const formatStatusLabel = (status: TicketStatus) => {
  if (status === "pending") return "In-progress";
  return status.charAt(0).toUpperCase() + status.slice(1);
};

export default function TicketDetailsModal({
  open,
  onClose,
  ticket,
  onReply,
}: Props) {
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<TicketStatus>("open");
  const [statusOpen, setStatusOpen] = useState(false);
  const [messageError, setMessageError] = useState("");

  // Sync status whenever ticket changes
  useEffect(() => {
    if (ticket?.status) {
      setStatus(ticket.status);
    }
  }, [ticket]);

  // Close dropdown on outside click
  useEffect(() => {
    const close = () => setStatusOpen(false);
    if (statusOpen) document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [statusOpen]);

  // Close dropdown when modal closes
  useEffect(() => {
    if (!open) setStatusOpen(false);
  }, [open]);

  if (!open || !ticket) return null;

  const handleSubmit = () => {
    if (!message.trim()) {
      setMessageError("Response is required.");
      return;
    }

    setMessageError("");
    onReply(ticket.id, message, status); // 👈 backend still gets "pending"
    setMessage("");
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-xl relative flex flex-col h-[90vh]">

        {/* Close Button */}
        <button className="absolute top-3 right-3 z-20" onClick={onClose}>
          <X size={22} className="text-gray-500 hover:text-black" />
        </button>

        {/* Header */}
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold mb-1">Ticket #{ticket.id}</h2>
          <p className="text-gray-600">{ticket.subject}</p>
        </div>

        {/* Scrollable content */}
        <div className="p-5 space-y-6 overflow-y-auto flex-1">

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border">
            <Info label="Vendor" value={ticket.vendor_name} />
            <Info label="Contact Person" value={ticket.vendor_email} />
            <Info
              label="Issue Type"
              value={
                ticket.category
                  ? ticket.category.charAt(0).toUpperCase() + ticket.category.slice(1)
                  : ""
              }
            />
            <Info
              label="Priority"
              value={ticket.priority}
              className={
                ticket.priority === "high"
                  ? "bg-red-100 text-red-600"
                  : ticket.priority === "medium"
                  ? "bg-yellow-100 text-yellow-600"
                  : "bg-blue-100 text-blue-600"
              }
            />
            <Info
              label="Status"
              value={formatStatusLabel(ticket.status)}
              className={
                ticket.status === "open"
                  ? "bg-gray-100 text-gray-600"
                  : ticket.status === "pending"
                  ? "bg-blue-100 text-blue-600"
                  : "bg-green-100 text-green-600"
              }
            />
            <Info label="Created" value={formatDate(ticket.created_at)} />
            <Info label="Last Update" value={formatDate(ticket.updated_at)} />
          </div>

          {/* Description */}
          <Section title="Description">
            {ticket.description || "No details provided."}
          </Section>

          {/* Replies */}
          <div>
            <p className="font-semibold mb-2">Responses</p>

            {(!ticket.replies || ticket.replies.length === 0) && (
              <div className="bg-yellow-50 text-yellow-700 p-3 rounded-lg text-sm">
                <strong>No responses yet.</strong> This ticket has not been updated.
              </div>
            )}

            {ticket.replies?.length > 0 && (
              <div className="space-y-4">
                {ticket.replies.map((r: any) => (
                  <div key={r.id} className="bg-gray-50 p-3 rounded-lg border text-sm">
                    <p className="font-medium text-gray-700">Support Response:</p>
                    <p className="text-gray-600">{r.message}</p>
                    <p className="text-xs text-gray-400 mt-1">{formatDate(r.created_at)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Response Input */}
          <div>
            <p className="font-medium mb-1">Add Response</p>

            <textarea
              className={`w-full rounded-lg p-3 h-24 border ${
                messageError ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Type your response..."
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                if (messageError) setMessageError("");
              }}
            />

            {messageError && (
              <p className="mt-1 text-xs text-red-600">{messageError}</p>
            )}

            {/* Status Dropdown */}
            <div className="relative mt-3 w-48">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setStatusOpen((v) => !v);
                }}
                className="w-full flex items-center justify-between border rounded-lg px-3 py-2 text-sm bg-white hover:bg-gray-50"
              >
                <span className="capitalize px-2 py-1 rounded-md text-xs">
                  {formatStatusLabel(status)}
                </span>
                <span className="text-gray-400">▾</span>
              </button>

              {statusOpen && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute z-20 bottom-full mb-1 w-full bg-white border rounded-lg shadow-lg overflow-hidden"
                >
                  {(["open", "pending", "closed"] as TicketStatus[]).map((s) => (
                    <button
                      key={s}
                      onClick={() => {
                        setStatus(s);
                        setStatusOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm capitalize hover:bg-purple-50 ${
                        status === s ? "bg-purple-100 text-purple-700" : ""
                      }`}
                    >
                      {formatStatusLabel(s)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg">
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

/* -------- Helper Components -------- */

function Info({
  label,
  value,
  className = "",
  pill = false,
}: {
  label: string;
  value: any;
  className?: string;
  pill?: boolean;
}) {
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      {pill || className ? (
        <span className={`px-2 py-1 rounded-md text-xs inline-block ${className}`}>
          {value}
        </span>
      ) : (
        <p className="font-medium">{value}</p>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: any }) {
  return (
    <div>
      <p className="font-medium mb-1">{title}</p>
      <div className="bg-gray-50 border rounded-xl p-3 text-gray-700">
        {children}
      </div>
    </div>
  );
}
