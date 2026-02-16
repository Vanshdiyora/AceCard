import { useEffect, useState, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { fetchVendors, archiveVendor, unarchiveVendor } from "../slice";
import UnarchiveVendorModal from "../components/UnarchiveVendorModal";

import PageHeader from "../../../common/components/layout/PageHeader";
import PageFilters from "../../../common/components/layout/PageFilter";
import DataTable, { type Column } from "../../../common/components/table/DataTable";
import ErrorAlert from "../../../common/ui/ErrorAlert";
import BlockingLoader from "../../../common/ui/BlockingLoader";
import ResultModal from "../../../common/ui/ResultModal";

import NotifyVendorModal from "../components/NotifyVendorModal";
import AddVendorModal from "../components/AddVendorModal";
import EditVendorModal from "../components/EditVendorModal";
import UpdateSeatsModal from "../components/UpdateSeatModal";
import ArchiveVendorModal from "../components/ArchiveVendorModal";
import RowActionsDropdown from "../components/RowActionsDropdown";
import { useNavigate } from "react-router-dom";
import { downloadCSV } from "../../../common/components/helper/DownloadCsv";
import { vendorsService } from "../services/vendors.service";
import type { VendorItem } from "../types";
import { User2Icon } from "lucide-react";

function deriveStage(v: VendorItem): string {
  if (v.status === "active") return "On-boarded";
  if (v.status === "archived") return "Suspended";
  return "In Progress";
}

function getErrorMessage(err: unknown): string {
  if (typeof err === "string") return err;
  if (err instanceof Error) return err.message;
  return "Something went wrong";
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getAvatarColor(seed: string) {
  const colors = [
    "bg-purple-100 text-purple-700",
    "bg-blue-100 text-blue-700",
    "bg-green-100 text-green-700",
    "bg-orange-100 text-orange-700",
    "bg-pink-100 text-pink-700",
  ];

  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
}

export default function VendorsPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { vendors, loading, meta, error: fetchError } = useAppSelector((s) => s.vendors);
  const { seatsUpdating } = useAppSelector(s => s.vendors);
  const [activeTab, setActiveTab] = useState<"all" | "active" | "archived">("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"recent" | "name">("recent");
  const [page, setPage] = useState(1);

  const pageSize = 10;

  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [seatsOpen, setSeatsOpen] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [notifyOpen, setNotifyOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<VendorItem | null>(null);
  const [unarchiveOpen, setUnarchiveOpen] = useState(false);

  const [processing, setProcessing] = useState(false);
  const [resultOpen, setResultOpen] = useState(false);
  const [resultSuccess, setResultSuccess] = useState(true);
  const [resultMessage, setResultMessage] = useState("");

  const showResult = (success: boolean, message: string) => {
    setResultSuccess(success);
    setResultMessage(message);
    setResultOpen(true);
  };

  useEffect(() => {
    const params: any = { page, page_size: pageSize };

    if (search.trim()) params.search = search.trim();
    if (activeTab !== "all") params.status = activeTab;

    dispatch(fetchVendors(params));
  }, [dispatch, page, pageSize, search, activeTab]);

  const finalVendors = useMemo(() => {
    let list = [...vendors];

    if (activeTab !== "all") list = list.filter(v => v.status === activeTab);

    if (sort === "name") list.sort((a, b) => a.legal_name.localeCompare(b.legal_name));

    return list;
  }, [vendors, activeTab, sort]);

  const handleExportVendors = async () => {
    try {
      const totalCount = meta?.total_count ?? 0;
      if (!totalCount) return;

      const params = {
        page: 1,
        page_size: totalCount,
        search: search.trim() || undefined,
        status: activeTab !== "all" ? activeTab : undefined,
      };

      // 🚫 NO REDUX DISPATCH
      const result = await vendorsService.list(params);

      const csvData = result.data.map((v: VendorItem) => ({
        "Vendor Name": v.legal_name,
        "POC Name": v.vendor_poc_name, // ✅ added
        "Vendor Email": v.primary_email,
        "Vendor Phone": v.primary_phone,
        "Vendor GST": v.gst ?? "",
        "Price per Card": v.pricing_per_card,
        Seats: v.seats_appointed,
        Status: v.status === "active" ? "Active" : "Archived",
        Stage: deriveStage(v),
      }));

      downloadCSV(csvData, "vendors_export.csv");
    } catch (err) {
      console.error("Vendor export failed:", err);
    }
  };

  const columns: Column<VendorItem>[] = [
    {
      header: "Vendor",
      width: "2.8fr",
      render: (v) => (
        <div className="flex items-center gap-3 min-w-0">
          {/* Avatar */}
          {v.avatar ? (
            <img
              src={v.avatar}
              alt={v.legal_name}
              className="w-9 h-9 rounded-full object-cover border"
            />
          ) : (
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold ${getAvatarColor(
                v.legal_name
              )}`}
            >
              {getInitials(v.legal_name)}
            </div>
          )}

          {/* Name + email */}
          <div className="min-w-0">
            <div className="font-medium truncate">
              {v.legal_name}
            </div>
            <div className="text-xs text-gray-400 truncate">
              {v.primary_email}
            </div>
          </div>
        </div>
      ),
    },

    // { header: "Vendor Email", accessor: "primary_email", width: "2fr" },
    { header: "Vendor Phone", accessor: "primary_phone", width: "1.5fr" },
    { header: "POC Name", accessor: "vendor_poc_name", width: "1.5fr" },
    // { header: "Vendor GST", width: "1.5fr", render: (v) => v.gst ?? "—" },
    { header: "Seats", accessor: "seats_appointed", align: "left", width: "1fr" },
    {
      header: "Status",
      render: (v) => (
        <span className={`px-2 py-1 rounded text-xs ${v.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
          }`}>
          {v.status === "active" ? "Active" : "Archived"}
        </span>
      ),
    },
    { header: "Stage", render: deriveStage },
    {
      header: "Actions",
      // width: "1fr",
      align: "right",
      render: (v) => (
        <RowActionsDropdown
          status={v.status}
          onEdit={() => { setSelectedVendor(v); setEditOpen(true); }}
          onSeats={() => { setSelectedVendor(v); setSeatsOpen(true); }}
          onNotify={() => { setSelectedVendor(v); setNotifyOpen(true); }}
          onArchive={() => { setSelectedVendor(v); setArchiveOpen(true); }}
          onUnarchive={() => {
            setSelectedVendor(v);
            setUnarchiveOpen(true);
          }}
        />
      ),
    },
  ];
  const totalVendors = meta?.total_count ?? 0;

  const isAnyModalOpen =
    addOpen ||
    editOpen ||
    seatsOpen ||
    archiveOpen ||
    notifyOpen ||
    unarchiveOpen ||
    resultOpen;

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

    if (isAnyModalOpen) {
      lockScroll();
    } else {
      unlockScroll();
    }

    return () => {
      unlockScroll();
    };
  }, [isAnyModalOpen]);

  return (
    <div className="px-6 pb-6">
      <div className="mb-4">
        <div className="bg-white rounded-3xl p-6 w-[280px] shadow-sm flex items-center gap-4">

          <div className="w-14 h-14 rounded-2xl bg-green-100 border border-green-300 flex items-center justify-center shrink-0">
            <User2Icon className="w-6 h-6 text-green-600" />
          </div>


          {/* Text Content */}
          <div className="flex flex-col justify-center">
            <p className="text-sm text-gray-500 font-medium">
              Total Vendors
            </p>

            <p className="mt-1 text-3xl font-bold text-gray-900 tracking-tight">
              {totalVendors}
            </p>
          </div>

        </div>
      </div>


      <PageHeader title="Vendor Management" description="Manage vendor onboarding & verification" addButtonLabel="Add Vendor" onAdd={() => setAddOpen(true)} />
      <ErrorAlert message={fetchError} />
      <BlockingLoader show={processing || seatsUpdating} />

      <AddVendorModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSuccess={() => showResult(true, "Vendor created successfully.")}
        onError={(msg) => showResult(false, msg)}
        setProcessing={setProcessing}
      />

      {selectedVendor && (
        <>
          <EditVendorModal vendor={selectedVendor} open={editOpen} onClose={() => setEditOpen(false)} />
          <UpdateSeatsModal vendor={selectedVendor} open={seatsOpen} onClose={() => setSeatsOpen(false)} />
          <NotifyVendorModal vendor={selectedVendor} open={notifyOpen} onClose={() => setNotifyOpen(false)} />
          <ArchiveVendorModal
            vendor={selectedVendor}
            open={archiveOpen}
            onClose={() => setArchiveOpen(false)}
            onConfirm={async () => {
              try {
                setProcessing(true);
                await dispatch(archiveVendor(selectedVendor.id)).unwrap();
                showResult(true, "Vendor archived successfully.");
                setArchiveOpen(false);
              } catch (err) {
                showResult(false, getErrorMessage(err));
              } finally {
                setProcessing(false);
              }
            }}
          />
          <UnarchiveVendorModal
            vendor={selectedVendor}
            open={unarchiveOpen}
            onClose={() => setUnarchiveOpen(false)}
            onConfirm={async () => {
              try {
                setProcessing(true);
                await dispatch(unarchiveVendor(selectedVendor.id)).unwrap();
                showResult(true, "Vendor unarchived successfully.");
                setUnarchiveOpen(false);
              } catch (err) {
                showResult(false, getErrorMessage(err));
              } finally {
                setProcessing(false);
              }
            }}
          />

        </>
      )}


      <PageFilters
        tabs={[
          { label: "All", value: "all" },
          { label: "Active", value: "active" },
          { label: "Archived", value: "archived" },
        ]}
        activeTab={activeTab}
        onTabChange={(v) => {
          setActiveTab((prev) => {
            if (prev === v) return prev;
            setPage(1);
            return v as "all" | "active" | "archived";
          });
        }}
        searchPlaceholder="Search vendors..."
        onSearch={(v) => {
          setSearch((prev) => {
            if (prev === v) return prev; // 🚫 no-op
            setPage(1);
            return v;
          });
        }}

        filters={[
          {
            key: "sort",
            placeholder: "Sort by",
            value: sort,
            onChange: (v) => { setSort(v as "recent" | "name"); setPage(1); },
            options: [
              { label: "Recent", value: "recent" },
              { label: "Name A–Z", value: "name" },
            ],
          },
        ]}
        onExport={handleExportVendors}
        disableExport={loading}
      />


      <div className="mt-6">
        <DataTable<VendorItem>
          columns={columns}
          data={finalVendors}
          loading={loading}
          page={meta?.page ?? page}
          totalPages={meta?.total_pages ?? 1}
          onPageChange={setPage}
          emptyText="No vendors found"
          onRowClick={(v) => navigate(`/super/vendors/${v.id}`, { state: { vendor: v } })}
        />
      </div>

      <BlockingLoader show={processing} />

      <ResultModal
        open={resultOpen}
        success={resultSuccess}
        message={resultMessage}
        onClose={() => setResultOpen(false)}
      />
    </div>
  );
}
