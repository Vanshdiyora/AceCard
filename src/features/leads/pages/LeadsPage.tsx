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

import type { Lead, LeadStage } from "../types";

type SortType = "recent" | "name_asc" | "pipeline_desc";

export default function LeadsPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { leads, meta, loading, error } = useAppSelector((s) => s.leads);

  const [leadConfig, setLeadConfig] = useState<any>(null);
  const [importOpen, setImportOpen] = useState(false);

  const [activeTab, setActiveTab] = useState<"all" | LeadStage>("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortType>("recent");

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
      })
    );
  }, [dispatch, page, pageSize, search, activeTab]);

  /* ---------- Reset page on filter ---------- */
  useEffect(() => {
    setPage(1);
  }, [search, activeTab]);

  /* ---------- Columns ---------- */
  const columns: Column<Lead>[] = [
    { header: "Name", render: (l) => l.lead_name },
    { header: "Company", render: (l) => l.company ?? "—" },
    { header: "Owner", render: (l) => l.assigned_rep_name ?? "—" },
    { header: "Deal Amount", render: (l) => l.deal_amount ?? "—" },
    {
      header: "Stage",
      render: (l) => (
        <span className="px-2 py-1 rounded bg-gray-100 text-xs">
          {l.stage}
        </span>
      ),
    },
    {
      header: "Updated",
      render: (l) => new Date(l.updated_at).toLocaleDateString(),
    },
  ];

  /* ---------- Sorting ---------- */
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
            new Date(b.updated_at).getTime() -
            new Date(a.updated_at).getTime()
        );
    }
  }, [leads, sort]);

  /* ---------- Export ---------- */
  const handleExport = async () => {
    const total = meta?.total_count ?? 0;
    if (!total) return;

    const res = await LeadsService.getLeads(1, total);
    const csvData = res.data.map((l: Lead) => ({
      Name: l.lead_name,
      Company: l.company ?? "",
      Owner: l.assigned_rep_name ?? "",
      "Deal Amount": l.deal_amount ?? "",
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
            key: "sort",
            placeholder: "Sort by",
            value: sort,
            onChange: (v) => setSort(v as SortType),
            options: [
              { label: "Recent", value: "recent" },
              { label: "Name A-Z", value: "name_asc" },
              { label: "Pipeline High → Low", value: "pipeline_desc" },
            ],
          },
        ]}
        onExport={handleExport}
        onImport={() => setImportOpen(true)}
        disableExport={loading}
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
