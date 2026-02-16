import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";

import { fetchLeads, createLead } from "../slice";
import { LeadsService } from "../services/leads.service";

import PageHeader from "../../../common/components/layout/PageHeader";
import PageFilters from "../../../common/components/layout/PageFilter";
import DataTable, { type Column } from "../../../common/components/table/DataTable";

import ErrorAlert from "../../../common/ui/ErrorAlert";
import BlockingLoader from "../../../common/ui/BlockingLoader";
import ResultModal from "../../../common/ui/ResultModal";

import { downloadCSV } from "../../../common/components/helper/DownloadCsv";
import { settingsService } from "../../settings/services/settings.service";
import { getStageTabs } from "../../../common/components/helper/leadConfigHelpers";

import { parseCSV } from "../../../common/utils/parseCsv";
// import { validateLeadCsvRow } from "../utils/validateLeadCsvRow";
import { normalizeLeadCsvRow } from "../utils/normalizeLeadCsvRow";
import { downloadLeadExampleCsv } from "../utils/downloadLeadExampleCsv";

import ImportLeadsModal from "../components/ImportLeadsModal";

import type { Lead, LeadStage, SortBy, SortOrder } from "../types";
import { formatRupees } from "../../../common/utils/ruppeeFormater";

export default function LeadsPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { leads, meta, loading, error } = useAppSelector((s) => s.leads);

  const [leadConfig, setLeadConfig] = useState<any>(null);
  const [importOpen, setImportOpen] = useState(false);

  const [activeTab, setActiveTab] = useState<"all" | LeadStage>("all");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("recent");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [blocking, setBlocking] = useState(false);
  const [result, setResult] = useState({
    open: false,
    success: true,
    message: "",
  });
  const lockScroll = () => {
    const scrollBarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    document.body.style.paddingRight = `${scrollBarWidth}px`;
  };

  const unlockScroll = () => {
    document.documentElement.style.overflow = "";
    document.body.style.overflow = "";
    document.body.style.paddingRight = "";
  };
  useEffect(() => {
    const isAnyModalOpen = importOpen || result.open;

    if (isAnyModalOpen) {
      lockScroll();
    } else {
      unlockScroll();
    }

    return () => {
      unlockScroll();
    };
  }, [importOpen, result.open]);

  /* ---------- Load lead config ---------- */
  useEffect(() => {
    settingsService.getLeadsConfig().then(setLeadConfig);
  }, []);

  /* ---------- Fetch leads ---------- */
  useEffect(() => {
    dispatch(
      fetchLeads({
        page,
        pageSize,
        search,
        stage: activeTab !== "all" ? activeTab : undefined,

        sort_by: sortBy,
        sort_order: sortOrder,
      })
    );
  }, [dispatch, page, pageSize, search, activeTab, sortBy, sortOrder]);

  /* ---------- Reset page on filter ---------- */
  useEffect(() => {
    setPage(1);
  }, [search, activeTab, sortBy, sortOrder]);

  const stageColorMap = useMemo(() => {
    if (!leadConfig?.customFields) return {};

    const stageField = leadConfig.customFields.find(
      (f: any) => f.fieldId === "stage"
    );

    if (!stageField?.options) return {};

    return stageField.options.reduce((acc: any, option: any) => {
      const key = String(option.value).trim().toLowerCase();
      acc[key] = option.color;
      return acc;
    }, {});
  }, [leadConfig]);



  /* ---------- Columns ---------- */
  const columns: Column<Lead>[] = [
    { header: "Name", render: (l) => l.lead_name },
    { header: "Company", render: (l) => l.company ?? "—" },
    { header: "Owner", render: (l) => l.assigned_rep_name ?? "—" },
    {
      header: "Deal Amount",
      render: (l) =>
        l.deal_amount ? formatRupees(l.deal_amount) : "—",
    },
    {
      header: "Stage",
      render: (l) => {
        const color = stageColorMap[String(l.stage).toLowerCase()];
        return (
          <span
            className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded whitespace-nowrap  ${color
              ? `${color.bg} ${color.text} ${color.border}`
              : "bg-gray-100 text-gray-600 border-gray-200"
              }`}
          >
            {l.stage}
          </span>
        );
      },
    },
    {
      header: "Updated",
      render: (l) => new Date(l.updated_at).toLocaleDateString(),
    },
  ];

  /* ---------- Sorting ---------- */
  const finalLeads = leads;


  /* ---------- Export ---------- */
  const handleExport = async () => {
    const total = meta?.total_count ?? 0;
    if (!total) return;

    const res = await LeadsService.getLeads(1, total);
    const csvData = res.data.map((l: Lead) => ({
      Name: l.lead_name,
      Company: l.company ?? "",
      Owner: l.assigned_rep_name ?? "",
      "Deal Amount": formatRupees(l.deal_amount) ?? "",
      Stage: l.stage,
      "Updated At": new Date(l.updated_at).toLocaleString(),
    }));

    downloadCSV(csvData, "leads_export.csv");
  };

  /* ---------- Import ---------- */
  const handleImport = async (file: File) => {
    if (!leadConfig) {
      setResult({
        open: true,
        success: false,
        message: "Lead configuration not loaded",
      });
      return;
    }

    try {
      setBlocking(true);

      const rawRows = await parseCSV(file);
      let success = 0;
      let failed = 0;
      const rows = rawRows; // ✅ FIX

      for (const row of rows) {
        try {
          const payload = normalizeLeadCsvRow(row, leadConfig);

          if (!payload.lead_name || !payload.stage) {
            failed++;
            continue;
          }

          await dispatch(createLead(payload)).unwrap();
          success++;
        } catch (err) {
          failed++;
        }
      }


      dispatch(
        fetchLeads({
          page: 1,
          pageSize,
          search,
          stage: activeTab !== "all" ? activeTab : undefined,
        })
      );

      setResult({
        open: true,
        success: failed === 0,
        message:
          failed === 0
            ? `${success} leads imported successfully`
            : `${success} imported, ${failed} failed`,
      });
    } catch (err: any) {
      setResult({
        open: true,
        success: false,
        message: err?.message ?? "Import failed",
      });
    } finally {
      setBlocking(false);
      setImportOpen(false);
    }
  };

  return (
    <div className="p-6">
      <BlockingLoader show={blocking} />

      <ResultModal
        open={result.open}
        success={result.success}
        message={result.message}
        onClose={() => setResult({ ...result, open: false })}
      />

      <PageHeader title="Leads" description="Manage and track your leads" />

      {error && <ErrorAlert message={error} />}

      <PageFilters
        tabs={getStageTabs(leadConfig)}
        activeTab={activeTab}
        onTabChange={(v) => setActiveTab(v as any)}
        searchPlaceholder="Search by name, email, or company..."
        onSearch={setSearch}
        filters={[
          {
            key: "sort_by",
            title: "SORT BY",
            placeholder: "Sort by",
            value: sortBy,
            onChange: (v) => setSortBy(v as SortBy),
            options: [
              { label: "Recent", value: "recent" },
              { label: "Name", value: "name" },
              { label: "Deal Amount", value: "deal_amount" },
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

        onExport={handleExport}
        disableExport={loading || !meta || meta.total_count === 0}
        onImport={() => setImportOpen(true)}
      />
      <div className="mt-6" />
      <DataTable
        columns={columns}
        data={finalLeads}
        loading={loading}
        page={meta?.page ?? page}
        totalPages={meta?.total_pages ?? 1}
        onPageChange={setPage}
        emptyText="No leads found"
        onRowClick={(lead) => navigate(`${lead.id}`)}
      />

      <ImportLeadsModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onImport={handleImport}
        onDownloadTemplate={() => downloadLeadExampleCsv(leadConfig)}
      />
    </div>
  );
}
