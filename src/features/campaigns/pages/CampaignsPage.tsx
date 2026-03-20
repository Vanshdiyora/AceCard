import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { fetchCampaigns } from "../slice";
import { downloadCSV } from "../../../common/components/helper/DownloadCsv";
import PageHeader from "../../../common/components/layout/PageHeader";
import PageFilters, { type TabItem } from "../../../common/components/layout/PageFilter";
import DataTable, { type Column } from "../../../common/components/table/DataTable";
import CreateCampaignModal from "../components/CreateCampaignModal";
import ErrorAlert from "../../../common/ui/ErrorAlert";
import type { Campaign, CampaignStatus } from "../types";
import { CampaignService } from "../services/campaign.service";
import type { SortBy, SortOrder } from "../types";
import { formatRupees } from "../../../common/utils/ruppeeFormater";

const tabs: TabItem[] = [
  { label: "All", value: "all" },
  { label: "Planned", value: "planned" },
  { label: "Draft", value: "draft" },
  { label: "Active", value: "active" },
  { label: "Paused", value: "paused" },
  { label: "Archived", value: "archived" },
  { label: "Completed", value: "completed" },
  { label: "Expired", value: "expired" },
];

const STATUS_STYLES: Record<string, string> = {
  planned: "bg-blue-100 text-blue-700",
  draft: "bg-purple-100 text-purple-700",
  active: "bg-green-100 text-green-700",
  paused: "bg-yellow-100 text-yellow-700",
  archived: "bg-gray-100 text-gray-700",
  completed: "bg-emerald-100 text-emerald-700",
  expired: "bg-red-100 text-red-700",
};


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

  const [activeTab, setActiveTab] = useState<"all" | CampaignStatus>("all");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("recent");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

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
      queueMicrotask(() => setOpenCreate(true));
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  /* -------- Fetch -------- */
  useEffect(() => {
    dispatch(
      fetchCampaigns({
        page,
        page_size: pageSize,
        search: search || undefined,
        status: activeTab !== "all" ? activeTab : undefined,
        sort_by: sortBy,
        sort_order: sortOrder,
      })
    );
  }, [dispatch, page, pageSize, search, activeTab, sortBy, sortOrder]);

  useEffect(() => {
    queueMicrotask(() => setPage(1));
  }, [search, activeTab, sortBy, sortOrder]);

  /* -------- Sorting -------- */
  const finalData = items;

  /* -------- Table Columns -------- */
  const columns: Column<Campaign>[] = [
    { header: "Campaign", render: (c) => c.name },
    {
      header: "Status",
      render: (c) => {
        const style =
          STATUS_STYLES[c.status] ||
          "bg-gray-100 text-gray-600";

        return (
          <div className="flex items-center">
            <span
              className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded whitespace-nowrap ${style}`}
            >
              {c.status.charAt(0).toUpperCase() + c.status.slice(1)}
            </span>
          </div>
        );
      },
    },
    { header: "Budget", render: (c) => `${formatRupees(c.budget)}` },
    { header: "Leads", render: (c) => c.leads_generated },
    { header: "Pipeline", render: (c) => `${formatRupees(c.pipeline_value)}` },
    { header: "Conversion", render: (c) => `${c.conversion_rate}%` },
    { header: "Created", render: (c) => c.created_at.split("T")[0] },
    { header: "Updated", render: (c) => c.updated_at.split("T")[0] },
  ];

  const handleExportCampaigns = async () => {
    try {
      const totalCount = meta?.total_count ?? 0;
      if (!totalCount) return;

      const params = {
        page: 1,
        page_size: totalCount, // fetch all campaigns
        // search,
        // status: activeTab !== "all" ? activeTab : undefined,
      };

      // 🚫 NO REDUX DISPATCH
      const result = await CampaignService.getAll(params);

      const csvData = result.data.map((c) => ({
        "Campaign Name": c.name,
        "Campaign Description": c.description ?? "",
        "Target / Budget": c.budget,
        Status: c.status,
        "Start Date": c.start_date
          ? new Date(c.start_date).toLocaleDateString()
          : "",
        "End Date": c.end_date
          ? new Date(c.end_date).toLocaleDateString()
          : "",
      }));

      downloadCSV(csvData, "campaigns_export.csv");
    } catch (error) {
      console.error("Campaign export failed", error);
    }
  };

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
          onTabChange={(v) => setActiveTab(v as CampaignStatus | "all")}
          searchPlaceholder="Search campaigns..."
          onSearch={setSearch}
          filters={[
            {
              key: "sort_by",
              title: "SORT BY",
              placeholder: "Sort by",
              value: sortBy,
              onChange: (v) => setSortBy(v as SortBy),
              options: [
                { label: "Created At", value: "recent" },
                { label: "Updated At", value: "updated_at" },
                { label: "Name", value: "name" },
                { label: "Pipeline Value", value: "pipeline_value" },
              ],
            },
            {
              key: "sort_order",
              title: "ORDER",
              placeholder: "Order",
              value: sortOrder,
              onChange: (v) => setSortOrder(v as SortOrder),
              options: [
                { label: "Ascending", value: "asc" },
                { label: "Descending", value: "desc" },
              ],
            },
          ]}
          onExport={handleExportCampaigns}
          disableExport={loading || !meta || meta.total_count === 0}
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
