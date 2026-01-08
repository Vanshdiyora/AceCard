import { useEffect, useState, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { fetchAllTickets, replyTicket } from "../slice";
import { fetchVendors } from "../../vendors/slice";

import {
  MessageSquare,
  Clock,
  CheckCircle2,
} from "lucide-react";

import PageHeader from "../../../common/components/layout/PageHeader";
import PageFilters from "../../../common/components/layout/PageFilter";
import StatsGrid from "../../../common/components/cards/StatsGrid";
import TicketDetailsModal from "../components/TicketDetailsModal";

export default function SupportAdmin() {
  const dispatch = useAppDispatch();

  const { tickets, loading } = useAppSelector((s) => s.support);
  const { vendors } = useAppSelector((s) => s.vendors);

  const [activeTab, setActiveTab] = useState("open");
  const [search, setSearch] = useState("");
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [detailsModal, setDetailsModal] = useState(false);

  // Load tickets + vendors on first render
  useEffect(() => {
    dispatch(fetchAllTickets());
    dispatch(fetchVendors());
  }, [dispatch]);

  // -----------------------------------------
  // Vendor lookup maps (FAST O(1) lookup)
  // -----------------------------------------
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

  // ----------------- Stats -----------------
  const stats = useMemo(() => {
    return [
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
    ];
  }, [tickets]);

  // ----------------- Tab Filter -----------------
  const filteredByTab = useMemo(() => {
    if (activeTab === "all") return tickets;
    return tickets.filter((t) => t.status === activeTab);
  }, [tickets, activeTab]);

  // ----------------- Search Filter -----------------
  const filteredTickets = useMemo(() => {
    const s = search.toLowerCase();

    return filteredByTab.filter((t) => {
      const vendorName = vendorNameMap[t.vendor_id]?.toLowerCase() || "";
      const vendorContact = vendorContactMap[t.vendor_id]?.toLowerCase() || "";

      return (
        t.title?.toLowerCase().includes(s) ||
        vendorName.includes(s) ||
        vendorContact.includes(s) ||
        String(t.id).includes(s)
      );
    });
  }, [filteredByTab, search, vendorNameMap, vendorContactMap]);

  // ----------------- Open Details Modal -----------------
const openDetails = (ticket: any) => {
  setSelectedTicket({
    ...ticket,
    vendorName: vendorNameMap[ticket.vendor_id],
    vendorContact: vendorContactMap[ticket.vendor_id],
  });
  setDetailsModal(true);
};


  return (
    <div className="p-6 space-y-6">

      {/* HEADER */}
      <PageHeader
        title="Tickets & Support"
        description="Manage platform-wide support tickets"
      />

      {/* STATS */}
      <StatsGrid items={stats} />

      {/* FILTERS */}
      <PageFilters
        tabs={[
          { label: `Open (${stats[0].value})`, value: "open" },
          { label: `Pending (${stats[1].value})`, value: "pending" },
          { label: `Closed (${stats[2].value})`, value: "closed" },
          { label: "All", value: "all" },
        ]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        searchPlaceholder="Search tickets..."
        onSearch={setSearch}
      />

      {/* TABLE */}
      <div className="bg-white rounded-2xl border p-5">
        {loading ? (
          <p className="text-center text-gray-500 py-10">Loading tickets...</p>
        ) : filteredTickets.length === 0 ? (
          <p className="text-center text-gray-500 py-10">No tickets found.</p>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b text-gray-500 text-sm">
                <th className="pb-3">Ticket ID</th>
                <th className="pb-3">Vendor</th>
                <th className="pb-3">Contact</th>
                <th className="pb-3">Issue Type</th>
                <th className="pb-3">Subject</th>
                <th className="pb-3">Priority</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Assigned To</th>
                <th className="pb-3">Last Update</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="text-sm">
              {filteredTickets.map((t: any) => (
                <tr key={t.id} className="border-b last:border-0">
                  <td className="py-3 text-purple-600 font-medium">#{t.id}</td>

                  {/* Vendor Name */}
                  <td>{vendorNameMap[t.vendor_id] || "—"}</td>

                  {/* Vendor Contact */}
                  <td>{vendorContactMap[t.vendor_id] || "—"}</td>

                  <td>
                    <span className="px-2 py-1 rounded-md bg-gray-100 text-xs">
                      {t.category}
                    </span>
                  </td>

                  <td>{t.subject}</td>

                  {/* Priority */}
                  <td>
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
                  </td>

                  {/* Status */}
                  <td>
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
                  </td>

                  <td>{t.assigned_to || "—"}</td>
                  <td>{t.updated_at || "—"}</td>

                  <td className="text-right">
                    <button
                      className="px-3 py-1.5 rounded-lg border text-sm hover:bg-gray-100"
                      onClick={() => openDetails(t)}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* DETAILS MODAL */}
      <TicketDetailsModal
        open={detailsModal}
        onClose={() => setDetailsModal(false)}
        ticket={selectedTicket}
        onReply={async (ticketId: number, message: string, status: string) => {
          await dispatch(replyTicket({ ticketId, message, status }));
          await dispatch(fetchAllTickets()); // refresh UI after update
          setDetailsModal(false);
        }}
      />
    </div>
  );
}
