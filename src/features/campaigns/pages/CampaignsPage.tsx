import { useEffect, useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { fetchCampaigns } from "../slice";

import PageHeader from "../../../common/components/layout/PageHeader";
import PageFilters, { type TabItem } from "../../../common/components/layout/PageFilter";
import DataTable, { type Column } from "../../../common/components/table/DataTable";
import CreateCampaignModal from "../components/CreateCampaignModal";
import ErrorAlert from "../../../common/ui/ErrorAlert";
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
  const [searchParams, setSearchParams] = useSearchParams();

  const campaignsState = useAppSelector((s) => s.campaigns);
  const items: Campaign[] = Array.isArray(campaignsState?.items) ? campaignsState.items : [];
  const meta = campaignsState?.meta ?? null;
  const loading = campaignsState?.loading ?? false;
  const fetchError: string | null = campaignsState?.error ?? null;

  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"recent" | "name_asc" | "pipeline_desc">("recent");
  const [openCreate, setOpenCreate] = useState(false);

  useEffect(() => {
    if (!openCreate) return;

    const scrollY = window.scrollY;

    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";

    return () => {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      window.scrollTo(0, scrollY);
    };
  }, [openCreate]);

  /* -------- Auto open from redirect -------- */
  useEffect(() => {
    if (searchParams.get("open") === "create") {
      setOpenCreate(true);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  /* -------- Fetch -------- */
  useEffect(() => {
    dispatch(fetchCampaigns({ page, page_size: pageSize }));
  }, [dispatch, page, pageSize]);

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

  const sortFilter = useMemo(() => {
    return [
      {
        key: "sort",
        placeholder: "Sort",
        value: sort,
        onChange: (v: string) => setSort(v as any),
        options: [
          { label: "Recent", value: "recent" },
          { label: "Name A–Z", value: "name_asc" },
          { label: "Pipeline High–Low", value: "pipeline_desc" },
        ],
      },
    ];
  }, [sort]);

  /* -------- Sorting -------- */
  const finalData = useMemo(() => {
    const list = [...filtered];
    switch (sort) {
      case "name_asc":
        return list.sort((a, b) => a.name.localeCompare(b.name));
      case "pipeline_desc":
        return list.sort((a, b) => (b.pipeline_value || 0) - (a.pipeline_value || 0));
      case "recent":
      default:
        return list.sort(
          (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        );
    }
  }, [filtered, sort]);

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
    <div className="p-6">
      <PageHeader
        title="Campaigns"
        description="Manage and track your marketing campaigns"
        addButtonLabel="Create Campaign"
        onAdd={() => setOpenCreate(true)}
      />
      <ErrorAlert message={fetchError} />

      <CreateCampaignModal open={openCreate} onClose={() => setOpenCreate(false)} />

      <div className="relative my-6">
        <PageFilters
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          searchPlaceholder="Search campaigns..."
          onSearch={setSearch}
          filters={sortFilter}
          onExport={() => console.log("Export CSV")}
          onImport={() => console.log("Import CSV")}
        />
      </div>


      <div className="w-full overflow-x-auto my-6">
        <DataTable
          columns={columns}
          data={finalData}
          loading={loading}
          page={meta?.page ?? page}
          totalPages={meta?.total_pages ?? 1}
          onPageChange={setPage}
          onRowClick={(c) => navigate(`${c.id}`)}
        />
      </div>

    </div>
  );
}
