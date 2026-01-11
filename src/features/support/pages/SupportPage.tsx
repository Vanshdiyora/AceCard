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
import ErrorAlert from "../../../common/ui/ErrorAlert";
import BlockingLoader from "../../../common/ui/BlockingLoader";
import ResultModal from "../../../common/ui/ResultModal";

export default function SupportPage() {
  const dispatch = useAppDispatch();
  const { tickets, loading, error } = useAppSelector((s) => s.support);

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

  const formatDate = (iso?: string | null) => {
    if (!iso) return "Just now";

    const d = new Date(iso);

    return d.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  useEffect(() => {
    if (vendorId) {
      dispatch(fetchTickets(vendorId));
    }
  }, [vendorId, dispatch]);

  const [showModal, setShowModal] = useState(false);
  const [expandedTicket, setExpandedTicket] = useState<number | null>(null);

  const [processing, setProcessing] = useState(false);
  const [resultOpen, setResultOpen] = useState(false);
  const [resultSuccess, setResultSuccess] = useState(true);
  const [resultMessage, setResultMessage] = useState("");

  const showResult = (success: boolean, message: string) => {
    setResultSuccess(success);
    setResultMessage(message);
    setResultOpen(true);
  };

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
    <div className="p-6 min-h-screen">
      <PageHeader
        title="Support Center"
        description="Get help and manage your support requests"
        addButtonLabel="New Ticket"
        onAdd={() => setShowModal(true)}
      />

      {error && <ErrorAlert message={error} />}

      <div className="grid grid-cols-12 gap-8 mt-6">
        {/* LEFT */}
        <div className="col-span-8 space-y-6">
          <div className="bg-white rounded-2xl px-6 py-4 border shadow-sm">
            <span className="text-purple-600 font-semibold border-b-2 border-purple-600 pb-2 inline-block">
              Support Tickets
            </span>
          </div>

          {loading && !error ? (
            <div className="bg-white border rounded-2xl p-12 flex justify-center">
              <BrandLoader message="Loading tickets..." />
            </div>
          ) : tickets.length === 0 ? (
            <div className="bg-white border rounded-2xl p-12 text-center">
              <MessageSquare size={44} className="mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-700">
                No support tickets yet
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                You haven’t raised any support requests.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {tickets.map((t: any) => (
                <div
                  key={t.id}
                  className="bg-white border rounded-2xl p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex gap-4">
                      <div className="mt-1">{icons[t.category]}</div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-3 text-xs">
                          <span className="text-gray-500 font-medium">
                            TKT-{t.id}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full ${statusColors[t.status]}`}>
                            {t.status}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full ${priorityColors[t.priority]}`}>
                            {t.priority}
                          </span>
                        </div>

                        <h3 className="text-lg font-semibold text-gray-800">
                          {t.subject}
                        </h3>
                        <p className="text-sm text-gray-600">{t.description}</p>

                        <div className="flex items-center gap-5 text-xs text-gray-500 mt-2">
                          <span className="flex items-center gap-1">
                            <Clock size={14} /> {formatDate(t.created_at)}
                          </span>
                          <span>Category: {t.category}</span>
                        </div>
                      </div>
                    </div>

                    <MessageSquareMore
                      size={20}
                      className="text-gray-400 hover:text-gray-600 cursor-pointer"
                      onClick={() =>
                        setExpandedTicket(expandedTicket === t.id ? null : t.id)
                      }
                    />
                  </div>

                  {expandedTicket === t.id && (
                    <div className="mt-4 border-t pt-4 space-y-4">
                      {!t.replies?.length && (
                        <div className="bg-yellow-50 text-yellow-700 p-3 rounded-lg text-sm">
                          <strong>No replies yet.</strong> Your ticket is under review.
                        </div>
                      )}

                      {t.replies?.length > 0 && (
                        <div className="space-y-3">
                          {t.replies.map((r: any) => (
                            <div key={r.id} className="bg-gray-50 p-3 rounded-lg text-sm">
                              <p className="font-medium text-gray-700">Admin Reply</p>
                              <p className="text-gray-600">{r.message}</p>
                              <p className="text-xs text-gray-400 mt-1">
                                {formatDate(t.created_at)}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT */}
        <div className="col-span-4 space-y-6">
          <div className="bg-white border rounded-2xl p-6 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-5">Support Stats</h3>

            <div className="space-y-4 text-sm">
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2 text-gray-600">
                  <AlertCircle size={18} className="text-blue-500" /> Open Tickets
                </span>
                <span className="font-semibold">{openTickets}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2 text-gray-600">
                  <Clock size={18} className="text-orange-500" /> In Progress
                </span>
                <span className="font-semibold">{inProgress}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2 text-gray-600">
                  <CheckCircle2 size={18} className="text-green-600" /> Resolved
                </span>
                <span className="font-semibold">{resolved}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <NewTicketModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onSubmitStart={() => setProcessing(true)}
        onSubmitEnd={(success, message) => {
          setProcessing(false);
          showResult(success, message);
        }}
      />

      <BlockingLoader show={processing} />

      <ResultModal
        open={resultOpen}
        success={resultSuccess}
        message={resultMessage}
        onClose={() => setResultOpen(false)}
      />
    </div>
  );
}
