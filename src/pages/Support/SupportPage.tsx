import { useAppSelector } from "../../app/hooks";
import { AlertCircle, CheckCircle2, Clock, MessageSquare } from "lucide-react";

export default function SupportPage() {
  const { tickets, subscription } = useAppSelector((s) => s.support);

  // Counts
  const openTickets = tickets.filter((t) => t.status === "open").length;
  const inProgress = tickets.filter((t) => t.status === "in progress").length;
  const resolved = tickets.filter((t) => t.status === "resolved").length;

  // Just demo — in real use, calculate from timestamps
  const avgResponseTime = "2.4h";

  const priorityColors: any = {
    high: "bg-red-100 text-red-600",
    medium: "bg-yellow-100 text-yellow-700",
    low: "bg-blue-100 text-blue-700",
  };

  const statusColors: any = {
    open: "bg-blue-100 text-blue-700",
    resolved: "bg-green-100 text-green-700",
    "in progress": "bg-yellow-100 text-yellow-700",
  };

  const icons: any = {
    "Technical Issue": <AlertCircle className="text-gray-500" size={20} />,
    "Slot Request": <Clock className="text-gray-500" size={20} />,
    Subscription: <CheckCircle2 className="text-gray-500" size={20} />,
  };

  return (
    <div className="p-6 space-y-8">
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold">Support</h2>
          <p className="text-gray-500">Get help and manage your support tickets</p>
        </div>

        <button className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
          + New Ticket
        </button>
      </div>

      {/* ==== STAT CARDS (NEW) ==== */}
      <div className="grid grid-cols-4 gap-4">
        {/* Open Tickets */}
        <div className="border rounded-xl bg-white p-5 flex flex-col gap-2">
          <p className="text-gray-700">Open Tickets</p>
          <div className="flex items-center gap-2 text-xl font-semibold">
            <AlertCircle size={20} className="text-blue-600" />
            <span>{openTickets}</span>
          </div>
        </div>

        {/* In Progress */}
        <div className="border rounded-xl bg-white p-5 flex flex-col gap-2">
          <p className="text-gray-700">In Progress</p>
          <div className="flex items-center gap-2 text-xl font-semibold">
            <Clock size={20} className="text-yellow-600" />
            <span>{inProgress}</span>
          </div>
        </div>

        {/* Resolved */}
        <div className="border rounded-xl bg-white p-5 flex flex-col gap-2">
          <p className="text-gray-700">Resolved</p>
          <div className="flex items-center gap-2 text-xl font-semibold">
            <CheckCircle2 size={20} className="text-green-600" />
            <span>{resolved}</span>
          </div>
        </div>

        {/* Avg Response Time */}
        <div className="border rounded-xl bg-white p-5 flex flex-col gap-2">
          <p className="text-gray-700">Avg Response Time</p>
          <div className="flex items-center gap-2 text-xl font-semibold">
            <MessageSquare size={20} className="text-purple-600" />
            <span>{avgResponseTime}</span>
          </div>
        </div>
      </div>

      {/* ==== EXISTING TICKET LIST (unchanged) ==== */}
      <div className="space-y-5">
        {tickets.map((t) => (
          <div
            key={t.id}
            className="bg-white border rounded-xl p-5 shadow-sm flex justify-between items-start"
          >
            <div className="flex items-start gap-4">
              <div>{icons[t.category]}</div>

              <div>
                <h3 className="font-medium text-lg">{t.title}</h3>
                <p className="text-gray-500 text-sm flex gap-2">
                  <span>{t.category}</span>•<span>Created {t.created}</span>•
                  <span>{t.ticketNumber}</span>
                </p>
              </div>
            </div>

            <div className="flex flex-col items-end gap-2">
              <span
                className={`px-3 py-1 text-xs rounded-full ${
                  priorityColors[t.priority]
                }`}
              >
                {t.priority}
              </span>

              <span
                className={`px-3 py-1 text-xs rounded-full ${
                  statusColors[t.status]
                }`}
              >
                {t.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Subscription Section (unchanged) */}
      <div className="bg-white border rounded-xl p-6 shadow-sm space-y-4">
        <h3 className="font-semibold text-lg">Subscription Status</h3>

        <div className="bg-purple-50 border border-purple-100 rounded-lg p-4 flex items-center justify-between">
          <div>
            <p className="font-medium">{subscription.plan}</p>
            <p className="text-gray-600 text-sm">
              Next billing date: {subscription.billingDate}
            </p>
          </div>

          <span className="px-3 py-1 text-sm rounded-full bg-green-100 text-green-700">
            Active
          </span>
        </div>

        <div className="flex gap-3">
          <button className="border px-4 py-2 rounded-lg bg-white">
            View Billing History
          </button>

          <button className="border px-4 py-2 rounded-lg bg-white">
            Upgrade Plan
          </button>
        </div>
      </div>
    </div>
  );
}
