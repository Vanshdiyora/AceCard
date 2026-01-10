import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { fetchTickets } from "../slice";
import NewTicketModal from "../components/NewTicketModal";
import {
  AlertCircle,
  Clock,
  CheckCircle2,
  MessageSquare,
  MessageSquareMore,
  Folder,
} from "lucide-react";
import PageHeader from "../../../common/components/layout/PageHeader";
import BrandLoader from "../../../common/ui/BrandLoader";

export default function SupportPage() {
  const dispatch = useAppDispatch();
  const { tickets, loading } = useAppSelector((s) => s.support);

  const token = localStorage.getItem("token");
  let vendorId: number | null = null;

  if (token) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      vendorId = payload.vendor_id;
    } catch (error) {
      console.error("Failed to decode JWT", error);
    }
  }

  useEffect(() => {
    if (vendorId) {
      dispatch(fetchTickets(vendorId));
    }
  }, [vendorId, dispatch]);

  const [showModal, setShowModal] = useState(false);
  const [expandedTicket, setExpandedTicket] = useState<number | null>(null);

  const openTickets = tickets.filter((t) => t.status === "open").length;
  const inProgress = tickets.filter((t) => t.status === "pending").length;
  const resolved = tickets.filter((t) => t.status === "closed").length;

  const priorityColors: any = {
    high: "bg-red-100 text-red-600",
    medium: "bg-yellow-100 text-yellow-700",
    low: "bg-green-100 text-green-700",
    critical: "bg-red-200 text-red-700",
  };

  const statusColors: any = {
    open: "bg-blue-100 text-blue-700",
    closed: "bg-green-100 text-green-700",
    pending: "bg-yellow-100 text-yellow-700",
  };

  const icons: any = {
    technical: <AlertCircle size={20} className="text-gray-500" />,
    billing: <Folder size={20} className="text-gray-500" />,
    feature_request: <CheckCircle2 size={20} className="text-gray-500" />,
    general: <MessageSquare size={20} className="text-gray-500" />,
    others: <Clock size={20} className="text-gray-500" />,
  };

  return (
    <div className="p-6">
      <PageHeader
        title="Support Center"
        description="Get help and manage your support requests"
        addButtonLabel="New Ticket"
        onAdd={() => setShowModal(true)}
      />

      <div className="grid grid-cols-12 gap-6">
        {/* LEFT CONTENT */}
        <div className="col-span-8 space-y-5">
          <div className="bg-white rounded-xl p-5 border">
            <button className="text-purple-600 font-medium border-b-2 border-purple-600 pb-2">
              Support Tickets
            </button>
          </div>

          <div className="space-y-5">
            {loading ? (
              <div className="bg-white border rounded-xl p-10">
                <BrandLoader message="Loading tickets..." />
              </div>
            ) : tickets.length === 0 ? (
              <div className="bg-white border rounded-xl p-10 text-center text-gray-500">
                <MessageSquare size={40} className="mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold mb-1">No support tickets yet</h3>
                <p className="text-sm mb-4">
                  You haven’t raised any support requests.
                </p>
              </div>
            ) : (
              tickets.map((t: any) => (
                <div
                  key={t.id}
                  className="bg-white p-5 border rounded-xl shadow-sm hover:shadow-md transition"
                >
                  <div className="flex justify-between">
                    <div className="flex gap-4">
                      {icons[t.category]}
                      <div>
                        <div className="flex gap-3 items-center mb-1">
                          <span className="text-sm text-gray-500 font-medium">
                            TKT-{t.id}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-xs ${statusColors[t.status]}`}>
                            {t.status}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-xs ${priorityColors[t.priority]}`}>
                            {t.priority}
                          </span>
                        </div>
                        <h3 className="font-semibold text-lg">{t.subject}</h3>
                        <p className="text-gray-600 text-sm">{t.description}</p>
                        <div className="flex items-center gap-6 text-sm text-gray-500 mt-2">
                          <span className="flex items-center gap-1">
                            <Clock size={14} /> {t.created_at ?? "Just now"}
                          </span>
                          <span>Category: {t.category}</span>
                        </div>
                      </div>
                    </div>

                    <MessageSquareMore
                      className="text-gray-400 hover:text-gray-600 cursor-pointer"
                      onClick={() =>
                        setExpandedTicket(expandedTicket === t.id ? null : t.id)
                      }
                    />
                  </div>

                  {expandedTicket === t.id && (
                    <div className="mt-4 border-t pt-4 space-y-4">
                      {(!t.replies || t.replies.length === 0) && (
                        <div className="bg-yellow-50 text-yellow-700 p-3 rounded-lg text-sm">
                          <strong>No replies yet.</strong> Your ticket is under review.
                        </div>
                      )}

                      {t.replies?.length > 0 && (
                        <div className="space-y-3">
                          {t.replies.map((r: any) => (
                            <div key={r.id} className="bg-gray-50 p-3 rounded-lg text-sm">
                              <p className="font-medium text-gray-700">Admin Reply:</p>
                              <p className="text-gray-600">{r.message}</p>
                              <p className="text-xs text-gray-400 mt-1">{r.created_at}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="col-span-4 space-y-6">
          <div className="bg-white border rounded-xl p-5">
            <h3 className="font-semibold mb-4">Support Stats</h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="flex items-center gap-2">
                  <AlertCircle className="text-blue-500" size={18} /> Open Tickets
                </span>
                <span className="font-semibold">{openTickets}</span>
              </div>
              <div className="flex justify-between">
                <span className="flex items-center gap-2">
                  <Clock className="text-orange-500" size={18} /> In Progress
                </span>
                <span className="font-semibold">{inProgress}</span>
              </div>
              <div className="flex justify-between">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="text-green-600" size={18} /> Resolved
                </span>
                <span className="font-semibold">{resolved}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <NewTicketModal open={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
}
