import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { fetchCampaigns } from "../slice";

import PageHeader from "../../../common/components/layout/PageHeader";
import PageFilters, { type TabItem } from "../../../common/components/layout/PageFilter";
import DataTable, { type Column } from "../../../common/components/table/DataTable";
import StatsGrid from "../../../common/components/cards/StatsGrid";
import CreateCampaignModal from "../components/CreateCampaignModal";
import type { Campaign } from "../types";

const tabs: TabItem[] = [
  { label: "All", value: "all" },
  { label: "Planned", value: "planned" },
  { label: "Draft", value: "draft" },
  { label: "Active", value: "active" },
  { label: "Paused", value: "paused" },
  { label: "Completed", value: "completed" },
  { label: "Archived", value: "archived" },
];

export default function CampaignsPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const campaignsState = useAppSelector((s) => s.campaigns);

const items: Campaign[] = Array.isArray(campaignsState?.items)
  ? campaignsState!.items
  : [];

const meta = campaignsState?.meta ?? null;
const loading = campaignsState?.loading ?? false;


  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"recent" | "name_asc" | "pipeline_desc">("recent");
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [openCreate, setOpenCreate] = useState(false);

  useEffect(() => {
    dispatch(fetchCampaigns());
  }, [dispatch]);

  /* -------- Filtering -------- */
  const filtered = useMemo(() => {
    return items.filter((c) => {
      const q = search.toLowerCase();
      const match =
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q);

      if (!match) return false;
      if (activeTab !== "all" && c.status !== activeTab) return false;

      return true;
    });
  }, [items, search, activeTab]);

  /* -------- Sorting -------- */
  const finalData = useMemo(() => {
    const list = [...filtered];

    switch (sort) {
      case "name_asc":
        return list.sort((a, b) => a.name.localeCompare(b.name));
      case "pipeline_desc":
        return list.sort(
          (a, b) => (b.pipeline_value || 0) - (a.pipeline_value || 0)
        );
      case "recent":
      default:
        return list.sort(
          (a, b) =>
            new Date(b.updated_at).getTime() -
            new Date(a.updated_at).getTime()
        );
    }
  }, [filtered, sort]);

  /* -------- Stats -------- */
  const stats = [
    {
      title: "Total Leads",
      value: items.reduce((s, c) => s + (c.leads_generated || 0), 0),
    },
    {
      title: "Total Pipeline",
      value: `$${items.reduce((s, c) => s + (c.pipeline_value || 0), 0)}K`,
    },
    {
      title: "Avg Conversion",
      value: items.length
        ? `${(
            items.reduce((s, c) => s + (c.conversion_rate || 0), 0) /
            items.length
          ).toFixed(2)}%`
        : "0%",
    },
    {
      title: "Total Budget",
      value: `$${items.reduce((s, c) => s + (c.budget || 0), 0)}K`,
    },
  ];

  /* -------- Table Columns -------- */
  const columns: Column<Campaign>[] = [
    { header: "Campaign", render: (c) => c.name },
    { header: "Status", render: (c) => c.status },
    { header: "Budget", render: (c) => `$${c.budget}K` },
    { header: "Leads", render: (c) => c.leads_generated },
    { header: "Pipeline", render: (c) => `$${c.pipeline_value}K` },
    { header: "Conversion", render: (c) => `${c.conversion_rate}%` },
    { header: "Created", render: (c) => c.created_at.split("T")[0] },
    { header: "Updated", render: (c) => c.updated_at.split("T")[0] },
  ];

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Campaigns"
        description="Manage and track your marketing campaigns"
        addButtonLabel="Create Campaign"
        onAdd={() => setOpenCreate(true)}
      />

      <CreateCampaignModal open={openCreate} onClose={() => setOpenCreate(false)} />

      <StatsGrid items={stats} />

      <div className="relative">  
        <PageFilters
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          searchPlaceholder="Search campaigns..."
          onSearch={setSearch}
          onFilter={() => setShowSortDropdown((p) => !p)}
          onExport={() => console.log("Export CSV")}
          onImport={() => console.log("Import CSV")}
        />

        {showSortDropdown && (
          <div className="absolute right-6 mt-2 w-48 bg-white border rounded-lg shadow-lg z-20 text-sm">
            {[
              ["recent", "Recent"],
              ["name_asc", "Name A-Z"],
              ["pipeline_desc", "Pipeline High-Low"],
            ].map(([v, l]) => (
              <div
                key={v}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => {
                  setSort(v as any);
                  setShowSortDropdown(false);
                }}
              >
                {l}
              </div>
            ))}
          </div>
        )}
      </div>

      <DataTable
        columns={columns}
        data={finalData}
        emptyText={loading ? "Loading..." : "No campaigns found"}
        onRowClick={(c) => navigate(`${c.id}`)}
      />

      {/* Pagination */}
      {meta && (
        <div className="flex justify-end items-center gap-4 text-sm">
          <button
            disabled={!meta.has_previous}
            className="px-3 py-1 border rounded disabled:opacity-40"
            onClick={() =>
              dispatch(fetchCampaigns())
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
              dispatch(fetchCampaigns())
            }
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
