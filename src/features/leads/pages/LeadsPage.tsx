import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import {
  fetchLeads,
  createLead,
  updateLead,
  // archiveLead,
} from "../slice";

import PageHeader from "../../../common/components/layout/PageHeader";
import PageFilters, { type TabItem } from "../../../common/components/layout/PageFilter";

import AddLeadModal from "../components/AddLeadModal";
import EditLeadModal from "../components/EditLeadModal";
import type { Lead } from "../types";
import DataTable, { type Column } from "../../../common/components/table/DataTable";

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
  const navigate = useNavigate();

  const { leads } = useAppSelector((s) => s.leads ?? []);
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


  const columns: Column<Lead>[] = [
    {
      header: "Name",
      render: (lead) => lead.lead_name,
    },
    {
      header: "Owner",
      render: (lead) => lead.company ?? "—",
    },
    {
      header: "Product",
      render: (lead) => lead.products?.join(", ") ?? "—",
    },
    {
      header: "Stage",
      render: (lead) => (
        <span className="px-2 py-1 rounded bg-gray-100 text-sm">
          {lead.stage}
        </span>
      ),
    },
    {
      header: "Updated At",
      render: (lead) => lead.updated_at,
    },
    {
      header: "",
      align: "right",
      render: (lead) => (
        <button
          className="text-purple-600"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedLead(lead);
            setEditOpen(true);
          }}
        >
          Edit
        </button>
      ),
    },
  ];


  // 🔍 Filter logic
  const filteredLeads = useMemo(() => {
    return (leads ?? []).filter((l) => {
      const name = l.lead_name?.toLowerCase() ?? "";
      const company = l.company?.toLowerCase() ?? "";
      const email = l.email?.toLowerCase() ?? "";

      const searchValue = search.toLowerCase();

      const searchMatch =
        name.includes(searchValue) ||
        company.includes(searchValue) ||
        email.includes(searchValue);

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
      <DataTable
        columns={columns}
        data={finalLeads}
        emptyText="No leads found"
        onRowClick={(lead) => navigate(`${lead.id}`)}
      />


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
