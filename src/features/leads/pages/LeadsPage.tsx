import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { fetchLeads, createLead, updateLead } from "../slice";
import { fetchTeam } from "../../teams/slice";

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

type SortType = "recent" | "name_asc" | "pipeline_desc";

export default function LeadsPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { leads, meta, loading } = useAppSelector((s) => s.leads);
  const teamMembers = useAppSelector((s) => s.team.members);

  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<SortType>("recent");

  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const pageSize = meta?.page_size ?? 10;

  useEffect(() => {
    dispatch(fetchLeads({ page, pageSize }));
    dispatch(fetchTeam());
  }, [dispatch, page, pageSize]);

  useEffect(() => setPage(1), [activeTab, search]);

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
        lead.assigned_rep_id ? ownerMap.get(lead.assigned_rep_id) ?? "—" : "—",
    },
    { header: "Deal", render: (lead) => lead.deal_amount ?? "—" },
    {
      header: "Stage",
      render: (lead) => (
        <span className="px-2 py-1 rounded bg-gray-100 text-xs">
          {lead.stage}
        </span>
      ),
    },
    { header: "Updated", render: (lead) => new Date(lead.updated_at).toLocaleDateString() },
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
    const q = search.toLowerCase();
    return leads.filter((l) => {
      const match =
        l.lead_name.toLowerCase().includes(q) ||
        l.company?.toLowerCase().includes(q) ||
        l.email?.toLowerCase().includes(q);

      if (!match) return false;
      if (activeTab !== "all" && l.stage !== activeTab) return false;
      return true;
    });
  }, [leads, search, activeTab]);

  const finalLeads = useMemo(() => {
    const list = [...filteredLeads];
    switch (sort) {
      case "name_asc":
        return list.sort((a, b) => a.lead_name.localeCompare(b.lead_name));
      case "pipeline_desc":
        return list.sort((a, b) => (b.deal_amount || 0) - (a.deal_amount || 0));
      default:
        return list.sort(
          (a, b) =>
            new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        );
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

      <PageFilters
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        searchPlaceholder="Search by name, email, or company..."
        onSearch={setSearch}
        filters={[
          {
            key: "sort",
            placeholder: "Sort by",
            value: sort,
            onChange: (v) => setSort(v as SortType),
            options: [
              { label: "Recent", value: "recent" },
              { label: "Name A–Z", value: "name_asc" },
              { label: "Pipeline High → Low", value: "pipeline_desc" },
            ],
          },
        ]}
      />

      <DataTable
        columns={columns}
        data={finalLeads}
        emptyText={loading ? "Loading..." : "No leads found"}
        onRowClick={(lead) => navigate(`${lead.id}`)}
      />

      {meta && (
        <div className="flex justify-end gap-4 text-sm">
          <button disabled={!meta.has_previous} onClick={() => setPage(p => p - 1)}>Prev</button>
          <span>Page {meta.page} of {meta.total_pages}</span>
          <button disabled={!meta.has_next} onClick={() => setPage(p => p + 1)}>Next</button>
        </div>
      )}

      <AddLeadModal open={addOpen} onClose={() => setAddOpen(false)} onSubmit={(d:any)=>dispatch(createLead(d))}/>
      <EditLeadModal open={editOpen} lead={selectedLead} onClose={()=>setEditOpen(false)} onSubmit={(d)=>selectedLead && dispatch(updateLead({id:selectedLead.id,data:d}))}/>
    </div>
  );
}
