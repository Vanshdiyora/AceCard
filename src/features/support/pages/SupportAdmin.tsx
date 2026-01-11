import { useEffect, useState, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { fetchAllTickets, replyTicket } from "../slice";

import { MessageSquare, Clock, CheckCircle2 } from "lucide-react";

import PageHeader from "../../../common/components/layout/PageHeader";
import PageFilters from "../../../common/components/layout/PageFilter";
import StatsGrid from "../../../common/components/cards/StatsGrid";
import TicketDetailsModal from "../components/TicketDetailsModal";
import DataTable, { type Column } from "../../../common/components/table/DataTable";
import ErrorAlert from "../../../common/ui/ErrorAlert";
import StatsGridSkeleton from "../../../common/components/cards/StatsGridSkeleton";
import BlockingLoader from "../../../common/ui/BlockingLoader";
import ResultModal from "../../../common/ui/ResultModal";
type TicketStatus = "open" | "pending" | "closed";
export default function SupportAdmin() {
  const dispatch = useAppDispatch();
  
  const { tickets, loading, error, meta } = useAppSelector((s) => s.support);
  const { vendors } = useAppSelector((s) => s.vendors);
const [page, setPage] = useState(1);
const pageSize = 10;

  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [detailsModal, setDetailsModal] = useState(false);

  const [processing, setProcessing] = useState(false);
  const [resultOpen, setResultOpen] = useState(false);
  const [resultSuccess, setResultSuccess] = useState(true);
  const [resultMessage, setResultMessage] = useState("");

  const showResult = (success: boolean, message: string) => {
    setResultSuccess(success);
    setResultMessage(message);
    setResultOpen(true);
  };

 useEffect(() => {
  dispatch(fetchAllTickets({ page, page_size: pageSize }));
}, [dispatch, page]);

useEffect(() => {
  setPage(1);
}, [activeTab, search]);

  const formatDate = (value?: string) => {
    if (!value) return "—";
    const d = new Date(value);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const vendorNameMap = useMemo(() => {
    const map: Record<number, string> = {};
    vendors?.forEach((v: any) => (map[v.id] = v.legal_name || ""));
    return map;
  }, [vendors]);

  const vendorContactMap = useMemo(() => {
    const map: Record<number, string> = {};
    vendors?.forEach((v: any) => (map[v.id] = v.primary_email || ""));
    return map;
  }, [vendors]);

  const stats = useMemo(
    () => [
      {
        title: "Open Tickets",
        value: tickets.filter((t) => t.status === "open").length,
        icon: <MessageSquare className="text-purple-600" />,
      },
      {
        title: "Pending",
        value: tickets.filter((t) => t.status === "pending").length,
        icon: <Clock className="text-yellow-600" />,
      },
      {
        title: "Closed",
        value: tickets.filter((t) => t.status === "closed").length,
        icon: <CheckCircle2 className="text-green-600" />,
      },
    ],
    [tickets]
  );

  const filteredTickets = useMemo(() => {
    const s = search.toLowerCase();
    return tickets.filter((t) => {
      if (activeTab !== "all" && t.status !== activeTab) return false;
      return (
        t.subject?.toLowerCase().includes(s) ||
        vendorNameMap[t.vendor_id]?.toLowerCase().includes(s) ||
        vendorContactMap[t.vendor_id]?.toLowerCase().includes(s) ||
        String(t.id).includes(s)
      );
    });
  }, [tickets, activeTab, search, vendorNameMap, vendorContactMap]);

  const openDetails = (ticket: any) => {
    setSelectedTicket({
      ...ticket,
      vendorName: vendorNameMap[ticket.vendor_id],
      vendorContact: vendorContactMap[ticket.vendor_id],
    });
    setDetailsModal(true);
  };

  const columns: Column<any>[] = [
    { header: "Vendor", render: (t) => vendorNameMap[t.vendor_id] || "—" },
    { header: "Contact", render: (t) => vendorContactMap[t.vendor_id] || "—" },
    {
      header: "Issue Type",
      render: (t) => (
        <span className="px-2 py-1 rounded-md bg-gray-100 text-xs">{t.category}</span>
      ),
    },
    { header: "Subject", render: (t) => t.subject },
    {
      header: "Priority",
      render: (t) => (
        <span
          className={`px-2 py-1 rounded-md text-xs ${
            t.priority === "high"
              ? "bg-red-100 text-red-600"
              : t.priority === "medium"
              ? "bg-yellow-100 text-yellow-600"
              : "bg-blue-100 text-blue-600"
          }`}
        >
          {t.priority}
        </span>
      ),
    },
    {
      header: "Status",
      render: (t) => (
        <span
          className={`px-2 py-1 rounded-md text-xs ${
            t.status === "open"
              ? "bg-blue-100 text-blue-600"
              : t.status === "pending"
              ? "bg-yellow-100 text-yellow-600"
              : "bg-green-100 text-green-600"
          }`}
        >
          {t.status}
        </span>
      ),
    },
    { header: "Assigned To", render: (t) => t.assigned_to || "—" },
    { header: "Last Update", render: (t) => formatDate(t.updated_at) },
    {
      header: "",
      align: "right",
      render: (t) => (
        <button
          className="px-3 py-1.5 rounded-lg border text-sm hover:bg-gray-100"
          onClick={() => openDetails(t)}
        >
          View Details
        </button>
      ),
    },
  ];

  return (
    <div className="p-6">
      <PageHeader title="Tickets & Support" description="Manage platform-wide support tickets" />

      {error && <ErrorAlert message={error} />}

      {loading ? <StatsGridSkeleton /> : <StatsGrid items={stats} />}

      <div className="mt-6" />

      <PageFilters
        tabs={[
          { label: "All", value: "all" },
          { label: `Open`, value: "open" },
          { label: `Pending`, value: "pending" },
          { label: `Closed`, value: "closed" },
        ]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        searchPlaceholder="Search tickets..."
        onSearch={setSearch}
      />

      <div className="mt-6" />

      <DataTable
  columns={columns}
  data={filteredTickets}
  loading={loading}
  emptyText="No tickets found"
  page={page}
  totalPages={meta?.total_pages || 1}
  onPageChange={(p) => setPage(p)}
/>


      <TicketDetailsModal
        open={detailsModal}
        onClose={() => setDetailsModal(false)}
        ticket={selectedTicket}
        onReply={async (ticketId: number, message: string, status: TicketStatus) => {
          try {
            setProcessing(true);
            await dispatch(replyTicket({ ticketId, message, status })).unwrap();
            // await dispatch(fetchAllTickets());
            showResult(true, "Reply sent successfully.");
            setDetailsModal(false);
          } catch {
            showResult(false, "Failed to send reply.");
          } finally {
            setProcessing(false);
          }
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
