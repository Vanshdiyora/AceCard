import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { fetchLeads, updateLead } from "../slice";

import PageHeader from "../../../common/components/layout/PageHeader";
import PageFilters, { type TabItem } from "../../../common/components/layout/PageFilter";
import EditLeadModal from "../components/EditLeadModal";
import DataTable, { type Column } from "../../../common/components/table/DataTable";
import ErrorAlert from "../../../common/ui/ErrorAlert";

import type { Lead } from "../types";

const tabs: TabItem[] = [
  { label: "All", value: "all" },
  { label: "New", value: "new" },
  { label: "Contacted", value: "contacted" },
  { label: "Engaged", value: "engaged" },
  { label: "Qualified", value: "qualified" },
  { label: "Proposal Sent", value: "proposal_sent" },
  { label: "Converted", value: "converted" },
  { label: "Lost", value: "lost" },
];

type SortType = "recent" | "name_asc" | "pipeline_desc";

export default function LeadsPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { leads, meta, loading, error } = useAppSelector((s) => s.leads);

  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortType>("recent");

  const [editOpen, setEditOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const [page, setPage] = useState(1);
  const pageSize = 10;

useEffect(() => {
  dispatch(fetchLeads({ page, pageSize, search }));
}, [dispatch, page, pageSize, search]);

useEffect(() => {
  setPage(1);
}, [search, activeTab]);


  const columns: Column<Lead>[] = [
    { header: "Name", render: (lead) => lead.lead_name },
    { header: "Company", render: (lead) => lead.company ?? "—" },
    {
      header: "Owner",
      render: (lead) =>
        lead.assigned_rep_name ?? "—",
    },
    { header: "Deal Amount", render: (lead) => lead.deal_amount ?? "—" },
    { header: "Stage", render: (lead) => <span className="px-2 py-1 rounded bg-gray-100 text-xs">{lead.stage}</span> },
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

  const finalLeads = useMemo(() => {
  const list = [...leads];
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
}, [leads, sort]);

  return (
    <div className="p-6 space-y-6">
      <PageHeader title="Leads" description="Manage and track your leads" />
      {error && <ErrorAlert message={error} />}

      <PageFilters tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} searchPlaceholder="Search by name, email, or company..." onSearch={setSearch}
        filters={[{ key: "sort", placeholder: "Sort by", value: sort, onChange: (v) => setSort(v as SortType), options: [
          { label: "Recent", value: "recent" },
          { label: "Name A–Z", value: "name_asc" },
          { label: "Pipeline High → Low", value: "pipeline_desc" },
        ]}]} />

      <DataTable columns={columns} data={finalLeads} loading={loading} page={meta?.page ?? page} totalPages={meta?.total_pages ?? 1} onPageChange={setPage} emptyText="No leads found" onRowClick={(lead) => navigate(`${lead.id}`)} />

      <EditLeadModal open={editOpen} lead={selectedLead} onClose={() => setEditOpen(false)} onSubmit={(d) => selectedLead && dispatch(updateLead({ id: selectedLead.id, data: d }))} />
    </div>
  );
}
