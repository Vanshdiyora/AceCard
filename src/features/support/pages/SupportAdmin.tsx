import { useEffect, useState, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import {
  fetchAllTickets,
  replyTicket,
  fetchAdminSupportStats,
  fetchVendorNames
} from "../slice";
import { useSearchParams } from "react-router-dom";
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
const formatStatusLabel = (status: TicketStatus | string) => {
  if (status === "pending") return "In-progress";
  return status.charAt(0).toUpperCase() + status.slice(1);
};

export const formatDate = (value?: string) => {
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

export default function SupportAdmin() {
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";

  const {
    tickets,
    loading,
    error,
    meta,
    statsAdmin,
    statsAdminLoading,
    vendorNames
  } = useAppSelector((s) => s.support);

  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState(initialQuery);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [detailsModal, setDetailsModal] = useState(false);

  const [processing, setProcessing] = useState(false);
  const [resultOpen, setResultOpen] = useState(false);
  const [resultSuccess, setResultSuccess] = useState(true);
  const [resultMessage, setResultMessage] = useState("");
  const [filters, setFilters] = useState({
    vendor: "",
    fromDate: "",
    toDate: ""
  });

  const [appliedFilters, setAppliedFilters] = useState({
    vendor: "",
    fromDate: "",
    toDate: ""
  });

  const applyFilters = () => {
    setAppliedFilters(filters);
    setPage(1);
  };

  const showResult = (success: boolean, message: string) => {
    setResultSuccess(success);
    setResultMessage(message);
    setResultOpen(true);
  };
  useEffect(() => {
    if (initialQuery) {
      setSearch(initialQuery);
    }
  }, [initialQuery]);
  useEffect(() => {
    dispatch(fetchVendorNames());
  }, []);

  useEffect(() => {
    const params: any = { page, page_size: pageSize };

    if (search) params.search = search;
    if (activeTab !== "all") params.status = activeTab;
    if (appliedFilters.fromDate) params.from_date = appliedFilters.fromDate;
    if (appliedFilters.toDate) params.to_date = appliedFilters.toDate;
    if (appliedFilters.vendor) params.vendor_name = appliedFilters.vendor;


    dispatch(fetchAllTickets(params));
  }, [dispatch, page, search, activeTab, appliedFilters]);

  useEffect(() => {
    dispatch(fetchAdminSupportStats());
  }, [dispatch]);

  useEffect(() => {
    setPage(1);
  }, [activeTab, search]);

  useEffect(() => {
    if (!detailsModal) return;

    const scrollY = window.scrollY;

    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";

    return () => {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      window.scrollTo(0, scrollY);
    };
  }, [detailsModal]);



  const stats = useMemo(
    () => [
      {
        title: "Open Tickets",
        value: statsAdmin?.open ?? 0,
        icon: <MessageSquare className="text-purple-600" />,
      },
      {
        title: "In-progress",
        value: statsAdmin?.pending ?? 0,
        icon: <Clock className="text-yellow-600" />,
      },

      {
        title: "Closed",
        value: statsAdmin?.closed ?? 0,
        icon: <CheckCircle2 className="text-green-600" />,
      },
    ],
    [statsAdmin]
  );

  const openDetails = (ticket: any) => {
    setSelectedTicket(ticket);
    setDetailsModal(true);
  };
  const getIssueTypeStyles = (category?: string) => {
    const value = category?.toLowerCase();

    switch (value) {
      case "billing":
        return "bg-purple-100 text-purple-700";

      case "technical":
        return "bg-blue-100 text-blue-700";

      case "account":
        return "bg-green-100 text-green-700";

      case "bug":
        return "bg-red-100 text-red-700";

      case "feature request":
        return "bg-orange-100 text-orange-700";

      default:
        return "bg-gray-100 text-gray-600";
    }
  };
  const priorityColors: any = {
    high: "bg-red-100 text-red-600",
    medium: "bg-yellow-100 text-yellow-700",
    low: "bg-green-100 text-green-700",
    critical: "bg-red-200 text-red-700",
  };

  const columns: Column<any>[] = [
    { header: "Vendor", render: (t) => t.vendor_name || "—" },
    { header: "Contact", render: (t) => t.vendor_email || "—" },
    {
      header: "Issue Type",
      render: (t) => {
        const formatted =
          t.category
            ?.split("_")
            .map((word: string) =>
              word.charAt(0).toUpperCase() + word.slice(1)
            )
            .join(" ") || "—";

        return (
          <span
            className={`px-2 py-1 rounded-md text-xs font-medium ${getIssueTypeStyles(
              t.category
            )}`}
          >
            {formatted}
          </span>
        );
      },
    },


    { header: "Subject", render: (t) => t.subject },
    {
      header: "Priority",
      render: (t) => {
        const key = t.priority?.toLowerCase();
        return (
          <span
            className={`px-2 py-1 rounded-md text-xs font-medium ${priorityColors[key] || "bg-gray-100 text-gray-600"
              }`}
          >
            {t.priority?.charAt(0).toUpperCase() + t.priority?.slice(1)}
          </span>
        );
      },
    },

    {
      header: "Status",
      render: (t) => (
        <span
          className={`px-2 py-1 rounded-md text-xs ${t.status === "open"
            ? "bg-gray-100 text-gray-600"
            : t.status === "pending"
              ? "bg-blue-100 text-blue-600"
              : "bg-green-100 text-green-600"
            }`}
        >
          {formatStatusLabel(t.status)}
        </span>
      ),
    },
    {
      header: "Last Update",
      width: "1.5fr",
      render: (t) => formatDate(t.updated_at),
    },
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
      <PageHeader
        title="Tickets & Support"
        description="Manage platform-wide support tickets"
      />

      {error && <ErrorAlert message={error} />}

      {statsAdminLoading ? <StatsGridSkeleton /> : <StatsGrid items={stats} />}

      <div className="mt-6" />

      <PageFilters
        tabs={[
          { label: "All", value: "all" },
          { label: "Open", value: "open" },
          { label: "In-progress", value: "pending" },
          { label: "Closed", value: "closed" },
        ]}
        initialSearch={initialQuery}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        searchPlaceholder="Search tickets..."
        onSearch={setSearch}
        supportFilters={{
          vendors: vendorNames.map((v: string) => ({
            label: v,
            value: v,
          })),
          vendorValue: filters.vendor,
          onVendorChange: (v) => setFilters((f) => ({ ...f, vendor: v })),

          fromDate: filters.fromDate,
          toDate: filters.toDate,
          onFromDateChange: (v) => setFilters((f) => ({ ...f, fromDate: v })),
          onToDateChange: (v) => setFilters((f) => ({ ...f, toDate: v })),

          onApply: applyFilters,

          onInvalidDate: (msg) => {
            setResultSuccess(false);
            setResultMessage(msg);
            setResultOpen(true);
          }
        }}
      />

      <div className="mt-6" />

      <DataTable
        columns={columns}
        data={tickets}
        loading={loading}
        emptyText="No tickets found"
        page={page}
        totalPages={meta?.total_pages || 1}
        onPageChange={setPage}
      />

      <TicketDetailsModal
        open={detailsModal}
        onClose={() => setDetailsModal(false)}
        ticket={selectedTicket}
        onReply={async (ticketId: number, message: string, status: TicketStatus) => {
          try {
            setProcessing(true);
            await dispatch(replyTicket({ ticketId, message, status })).unwrap();
            showResult(true, "Reply sent successfully.");
            setDetailsModal(false);
            dispatch(fetchAdminSupportStats()); // refresh stats
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
