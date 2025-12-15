import { useEffect, useState, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import {
  fetchLeads,
  createLead,
  updateLead,
  archiveLead,
} from "../slice";

import PageHeader from "../../../common/components/layout/PageHeader";
import PageFilters, { type TabItem } from "../../../common/components/layout/PageFilter";

import LeadRow from "../components/LeadRow";
import AddLeadModal from "../components/AddLeadModal";
import EditLeadModal from "../components/EditLeadModal";
import type { Lead } from "../types";

// Tabs
const tabs: TabItem[] = [
  { label: "All", value: "all" },
  { label: "New", value: "new" },
  { label: "Contacted", value: "contacted" },
  { label: "Engaged", value: "engaged" },
  { label: "Qualified", value: "qualified" },
  { label: "Proposal Sent", value: "proposal_sent" },
  { label: "Negotiation", value: "negotiation" },
  { label: "Converted", value: "converted" },
  { label: "Lost", value: "lost" },
];

export default function LeadsPage() {
  const dispatch = useAppDispatch();
  const { leads } = useAppSelector((s) => s.leads);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  // ⭐ Sorting state
  const [sort, setSort] = useState("recent");

  // ⭐ Controls visibility of Sort dropdown
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  useEffect(() => {
    dispatch(fetchLeads());
  }, []);

  // 🔍 Filter logic
  const filteredLeads = useMemo(() => {
    return leads.filter((l) => {
      const searchMatch =
        l.lead_name.toLowerCase().includes(search.toLowerCase()) ||
        l.company.toLowerCase().includes(search.toLowerCase()) ||
        l.email.toLowerCase().includes(search.toLowerCase());

      if (!searchMatch) return false;
      if (activeTab !== "all" && l.stage !== activeTab) return false;

      return true;
    });
  }, [leads, search, activeTab]);

  // 🔥 Optimized Sorting
  const finalLeads = useMemo(() => {
    const list = [...filteredLeads];

    switch (sort) {
      case "recent":
        return list.sort(
          (a, b) =>
            new Date(b.updated_at).getTime() -
            new Date(a.updated_at).getTime()
        );

      case "name_asc":
        return list.sort((a, b) =>
          a.lead_name.localeCompare(b.lead_name)
        );

      case "pipeline_desc":
        return list.sort(
          (a, b) => (b.deal_amount || 0) - (a.deal_amount || 0)
        );

      case "stage":
        return list.sort((a, b) =>
          a.stage.localeCompare(b.stage)
        );

      default:
        return list;
    }
  }, [filteredLeads, sort]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <PageHeader
        title="Leads"
        description="Manage and track your leads"
        addButtonLabel="Add Lead"
        onAdd={() => setAddOpen(true)}
      />

      {/* FILTERS + SORT DROPDOWN */}
      <div className="relative">
        <PageFilters
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={(v) => setActiveTab(v)}
          searchPlaceholder="Search leads..."
          onSearch={(value) => setSearch(value)}
          onFilter={() => setShowSortDropdown((prev) => !prev)} // ⭐ Toggle dropdown
          onExport={() => console.log("Export action")}
        />

        {/* ⭐ SORT DROPDOWN UNDER FILTER BUTTON */}
        {showSortDropdown && (
          <div className="absolute right-6 mt-2 w-48 bg-white border rounded-lg shadow-lg z-20 text-sm">
            <div
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => {
                setSort("recent");
                setShowSortDropdown(false);
              }}
            >
              Recent
            </div>
            <div
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => {
                setSort("name_asc");
                setShowSortDropdown(false);
              }}
            >
              Name A–Z
            </div>
            <div
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => {
                setSort("pipeline_desc");
                setShowSortDropdown(false);
              }}
            >
              Pipeline High–Low
            </div>
            <div
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => {
                setSort("stage");
                setShowSortDropdown(false);
              }}
            >
              Stage
            </div>
          </div>
        )}
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl border shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-gray-50 text-left text-sm text-gray-600">
              <th className="py-3 px-4">Name</th>
              <th className="py-3 px-4">Owner</th>
              <th className="py-3 px-4">Product</th>
              <th className="py-3 px-4">Stage</th>
              <th className="py-3 px-4">Updated At</th>
              <th className="py-3 px-4"></th>
            </tr>
          </thead>

          <tbody>
            {finalLeads.map((lead) => (
              <LeadRow
                key={lead.id}
                lead={lead}
                onEdit={() => {
                  setSelectedLead(lead);
                  setEditOpen(true);
                }}
                onArchive={() => dispatch(archiveLead(lead.id))}
              />
            ))}

            {finalLeads.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-6 text-gray-500">
                  No leads found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Lead Modal */}
      <AddLeadModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSubmit={(data: any) => {
          dispatch(createLead(data));
          setAddOpen(false);
        }}
      />

      {/* Edit Lead Modal */}
      <EditLeadModal
        open={editOpen}
        lead={selectedLead}
        onClose={() => setEditOpen(false)}
        onSubmit={(data: any) => {
          if (!selectedLead) return;
          dispatch(updateLead({ id: selectedLead.id, data }));
          setEditOpen(false);
        }}
      />
    </div>
  );
}
