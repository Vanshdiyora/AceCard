import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { fetchTickets, fetchSupportStats } from "../slice";
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
import { getCookie } from "../../../utils/cookieUtils";

/* ---------------- Skeleton ---------------- */

function StatsSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-gray-200 rounded-full" />
            <div className="h-4 w-28 bg-gray-200 rounded" />
          </div>
          <div className="h-4 w-8 bg-gray-200 rounded" />
        </div>
      ))}
    </div>
  );
}

export default function SupportPage() {
  const dispatch = useAppDispatch();
  const { tickets, loading, error, stats, statsLoading } = useAppSelector(
    (s) => s.support
  );

  /* ---------------- AUTH ---------------- */

  const token = getCookie("token");
  let vendorId: number | null = null;

  if (token) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      vendorId = payload.vendor_id;
    } catch {
      console.error("Failed to decode JWT");
    }
  }

  useEffect(() => {
    if (vendorId) {
      dispatch(fetchTickets(vendorId));
      dispatch(fetchSupportStats());
    }
  }, [vendorId, dispatch]);

  /* ---------------- STATE ---------------- */

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

  /* ---------------- STATS ---------------- */

  const openTickets = stats?.open ?? 0;
  const inProgress = stats?.pending ?? 0;
  const resolved = stats?.closed ?? 0;

  /* ---------------- HELPERS ---------------- */

  const formatDate = (iso?: string | null) => {
    if (!iso) return "Just now";
    return new Date(iso).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const priorityColors: any = {
    high: "bg-red-100 text-red-600",
    medium: "bg-yellow-100 text-yellow-700",
    low: "bg-green-100 text-green-700",
    critical: "bg-red-200 text-red-700",
  };

  const statusColors: any = {
    open: "bg-gray-100 text-gray-700",
    pending: "bg-blue-100 text-blue-700",
    closed: "bg-green-100 text-green-700",
  };

  const statusLabels: Record<string, string> = {
    open: "Open",
    pending: "In-progress",
    closed: "Closed",
  };

  const icons: any = {
    technical: <AlertCircle size={20} className="text-gray-500" />,
    billing: <Folder size={20} className="text-gray-500" />,
    feature_request: <CheckCircle2 size={20} className="text-gray-500" />,
    general: <MessageSquare size={20} className="text-gray-500" />,
    others: <Clock size={20} className="text-gray-500" />,
  };


  /* ---------------- UI ---------------- */

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
              {tickets.map((t: any) => {
                const hasReplies = t.replies && t.replies.length > 0;
                const isExpanded = expandedTicket === t.id;

                return (
                  <div
                    key={t.id}
                    className="bg-white border rounded-2xl p-6 hover:shadow-md transition-shadow"
                  >
                    {/* HEADER */}
                    <div className="flex justify-between items-start">
                      <div className="flex gap-4">
                        <div className="mt-1">{icons[t.category]}</div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-3 text-xs">
                            <span className="text-gray-500 font-medium">
                              TKT-{t.id}
                            </span>

                            <span
                              className={`px-2 py-0.5 rounded-full ${statusColors[t.status]}`}
                            >
                              {statusLabels[t.status]}
                            </span>

                            <span
                              className={`px-2 py-0.5 rounded-full ${priorityColors[t.priority]}`}
                            >
                              {t.priority}
                            </span>
                          </div>

                          <h3 className="text-lg font-semibold text-gray-800">
                            {t.subject}
                          </h3>

                          {/* CATEGORY + DESCRIPTION */}
                          <div className="text-sm text-gray-500">
                            <span className="font-medium capitalize">
                              {t.category}
                            </span>
                            <span className="mx-2">•</span>
                            <span className="text-gray-600">
                              {t.description}
                            </span>
                          </div>

                          <div className="flex items-center gap-5 text-xs text-gray-400 mt-2">
                            <span className="flex items-center gap-1">
                              <Clock size={14} />{" "}
                              {formatDate(t.created_at)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* TOGGLE */}
                      <MessageSquareMore
                        size={20}
                        className={`
    transition-transform
    ${hasReplies
                            ? isExpanded
                              ? "rotate-180 text-purple-600 cursor-pointer"
                              : "text-gray-400 hover:text-gray-600 cursor-pointer"
                            : "text-gray-300 cursor-not-allowed"
                          }
  `}
                        onClick={() => {
                          if (!hasReplies) return;
                          setExpandedTicket(isExpanded ? null : t.id);
                        }}
                      />

                    </div>

                    {/* EXPANDED – MESSAGES */}
                    <div
                      className={`overflow-hidden transition-all duration-300 ${isExpanded
                          ? "max-h-[520px] opacity-100 mt-5"
                          : "max-h-0 opacity-0"
                        }`}
                    >
                      <div className="pt-4 border-t">
                        <div className="max-h-72 overflow-y-auto space-y-3 pr-2">
                          {t.replies?.map((r: any) => (
                            <div
                              key={r.id}
                              className="bg-gradient-to-br from-gray-50 to-white border rounded-2xl px-4 py-3 shadow-sm"
                            >
                              <p className="text-sm text-gray-800">
                                {r.message}
                              </p>
                              <div className="text-[11px] text-gray-400 mt-1 text-right">
                                {formatDate(r.created_at)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT */}
        <div className="col-span-4 space-y-6">
          <div className="bg-white border rounded-2xl p-6 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-5">
              Support Stats
            </h3>

            {statsLoading || !stats ? (
              <StatsSkeleton />
            ) : (
              <div className="space-y-4 text-sm">
                <div className="flex justify-between">
                  <span className="flex items-center gap-2 text-gray-600">
                    <AlertCircle size={18} className="text-gray-500" /> Open
                  </span>
                  <span className="font-semibold">{openTickets}</span>
                </div>

                <div className="flex justify-between">
                  <span className="flex items-center gap-2 text-gray-600">
                    <Clock size={18} className="text-blue-500" /> In Progress
                  </span>
                  <span className="font-semibold">{inProgress}</span>
                </div>

                <div className="flex justify-between">
                  <span className="flex items-center gap-2 text-gray-600">
                    <CheckCircle2
                      size={18}
                      className="text-green-600"
                    />{" "}
                    Closed
                  </span>
                  <span className="font-semibold">{resolved}</span>
                </div>
              </div>
            )}
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
