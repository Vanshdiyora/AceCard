import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import {
  fetchLeads,
  createLead,
  updateLead,
} from "../slice";
import { fetchTeam } from "../../teams/slice"; // adjust path


import PageHeader from "../../../common/components/layout/PageHeader";
import PageFilters, { type TabItem } from "../../../common/components/layout/PageFilter";

import AddLeadModal from "../components/AddLeadModal";
import EditLeadModal from "../components/EditLeadModal";
import type { Lead } from "../types";
import DataTable, { type Column } from "../../../common/components/table/DataTable";


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

  const { leads, meta, loading } = useAppSelector((s) => s.leads);

  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const [sort, setSort] = useState("recent");
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  const page = meta?.page ?? 1;
  const pageSize = meta?.page_size ?? 10;

  useEffect(() => {
    dispatch(fetchLeads({ page: 1, pageSize }));
    dispatch(fetchTeam());
  }, [dispatch]);

  const teamMembers = useAppSelector((s) => s.team.members);

  const ownerMap = useMemo(() => {
    const map = new Map<number, string>();
    teamMembers.forEach((m) => map.set(m.id, m.name));
    return map;
  }, [teamMembers]);


  const columns: Column<Lead>[] = [
    { header: "Name", render: (lead) => lead.lead_name },
    { header: "Company", render: (lead) => lead.company ?? "—" },
    {
      header: "Owner",
      render: (lead) =>
        lead.assigned_rep_id
          ? ownerMap.get(lead.assigned_rep_id) ?? "—"
          : "—",
    },


    { header: "Deal Amount", render: (lead) => lead.deal_amount ?? "—" },
    {
      header: "Stage",
      render: (lead) => (
        <span className="px-2 py-1 rounded bg-gray-100 text-sm">
          {lead.stage}
        </span>
      ),
    },
    { header: "Updated At", render: (lead) => lead.updated_at },
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

  const filteredLeads = useMemo(() => {
    return leads.filter((l) => {
      const searchValue = search.toLowerCase();
      const match =
        l.lead_name.toLowerCase().includes(searchValue) ||
        l.company.toLowerCase().includes(searchValue) ||
        l.email.toLowerCase().includes(searchValue);

      if (!match) return false;
      if (activeTab !== "all" && l.stage !== activeTab) return false;

      return true;
    });
  }, [leads, search, activeTab]);

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
        return list.sort((a, b) => (b.deal_amount || 0) - (a.deal_amount || 0));
      default:
        return list;
    }
  }, [filteredLeads, sort]);

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Leads"
        description="Manage and track your leads"
        addButtonLabel="Add Lead"
        onAdd={() => setAddOpen(true)}
      />

      <div className="relative">
        <PageFilters
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          searchPlaceholder="Search leads..."
          onSearch={setSearch}
          onFilter={() => setShowSortDropdown((p) => !p)}
          onExport={() => console.log("Export action")}
        />

        {showSortDropdown && (
          <div className="absolute right-6 mt-2 w-48 bg-white border rounded-lg shadow-lg z-20 text-sm">
            {[
              ["recent", "Recent"],
              ["name_asc", "Name A-Z"],
              ["pipeline_desc", "Pipeline High-Low"],
            ].map(([value, label]) => (
              <div
                key={value}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => {
                  setSort(value);
                  setShowSortDropdown(false);
                }}
              >
                {label}
              </div>
            ))}
          </div>
        )}
      </div>

      <DataTable
        columns={columns}
        data={finalLeads}
        emptyText={loading ? "Loading..." : "No leads found"}
        onRowClick={(lead) => navigate(`${lead.id}`)}
      />

      {/* Pagination */}
      {meta && (
        <div className="flex justify-end items-center gap-4 text-sm">
          <button
            disabled={!meta.has_previous}
            className="px-3 py-1 border rounded disabled:opacity-40"
            onClick={() =>
              dispatch(fetchLeads({ page: meta.page - 1, pageSize }))
            }
          >
            Prev
          </button>
          <span>
            Page {meta.page} of {meta.total_pages}
          </span>
          <button
            disabled={!meta.has_next}
            className="px-3 py-1 border rounded disabled:opacity-40"
            onClick={() =>
              dispatch(fetchLeads({ page: meta.page + 1, pageSize }))
            }
          >
            Next
          </button>
        </div>
      )}

      <AddLeadModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSubmit={(data: any) => {
          dispatch(createLead(data));
          setAddOpen(false);
        }}
      />

      <EditLeadModal
        open={editOpen}
        lead={selectedLead}
        onClose={() => setEditOpen(false)}
        onSubmit={(data) => {
          if (!selectedLead) return;
          dispatch(updateLead({ id: selectedLead.id, data }));
          setEditOpen(false);
        }}
      />
    </div>
  );
}
