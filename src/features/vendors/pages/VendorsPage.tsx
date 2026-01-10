import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { fetchVendors, archiveVendor, unarchiveVendor } from "../slice";

import PageHeader from "../../../common/components/layout/PageHeader";
import PageFilters from "../../../common/components/layout/PageFilter";
import DataTable, { type Column } from "../../../common/components/table/DataTable";
import ErrorAlert from "../../../common/ui/ErrorAlert";

import NotifyVendorModal from "../components/NotifyVendorModal";
import AddVendorModal from "../components/AddVendorModal";
import EditVendorModal from "../components/EditVendorModal";
import UpdateSeatsModal from "../components/UpdateSeatModal";
import ArchiveVendorModal from "../components/ArchiveVendorModal";
import RowActionsDropdown from "../components/RowActionsDropdown";
import { useNavigate } from "react-router-dom";

import type { VendorItem } from "../types";

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

export default function VendorsPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { vendors, loading, meta, error: fetchError } = useAppSelector((s) => s.vendors);

  const [error, setError] = useState<string | null>(null);
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

  useEffect(() => {
    dispatch(fetchVendors({ page, page_size: pageSize }));
  }, [dispatch, page, pageSize, activeTab, search, sort]);

  const columns: Column<VendorItem>[] = [
    { header: "Vendor Name", accessor: "legal_name", width: "2fr" },
    { header: "Vendor Email", accessor: "primary_email", width: "2fr" },
    { header: "Vendor Phone", accessor: "primary_phone", width: "1.5fr" },
    { header: "Vendor GST", width: "1.5fr", render: (v) => v.gst ?? "—" },
    { header: "Seats", accessor: "seats_appointed", align: "center", width: "1fr" },
    {
      header: "Vendor Status",
      width: "1.5fr",
      render: (v) => (
        <span className={`px-2 py-1 rounded-full text-xs ${
          v.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
        }`}>
          {v.status === "active" ? "Active" : "Archived"}
        </span>
      ),
    },
    { header: "Stage", width: "1.5fr", render: deriveStage },
    {
      header: "Actions",
      width: "1fr",
      align: "right",
      render: (v) => (
        <RowActionsDropdown
          status={v.status}
          onEdit={() => { setSelectedVendor(v); setEditOpen(true); }}
          onSeats={() => { setSelectedVendor(v); setSeatsOpen(true); }}
          onNotify={() => { setSelectedVendor(v); setNotifyOpen(true); }}
          onArchive={() => { setSelectedVendor(v); setArchiveOpen(true); }}
          onUnarchive={async () => {
            try {
              await dispatch(unarchiveVendor(v.id)).unwrap();
              setError(null);
            } catch (err: unknown) {
              setError(getErrorMessage(err));
            }
          }}
        />
      ),
    },
  ];

  return (
    <div className="p-6">
      <PageHeader title="Vendor Management" description="Manage vendor onboarding & verification" addButtonLabel="Add Vendor" onAdd={() => setAddOpen(true)} />

      <AddVendorModal open={addOpen} onClose={() => setAddOpen(false)} />

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
                await dispatch(archiveVendor(selectedVendor.id)).unwrap();
                setArchiveOpen(false);
              } catch (err: unknown) {
                setError(getErrorMessage(err));
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
        onTabChange={(v) => { setActiveTab(v as "all" | "active" | "archived"); setPage(1); }}
        searchPlaceholder="Search vendors..."
        onSearch={(v) => { setSearch(v); setPage(1); }}
        filters={[{
          key: "sort",
          placeholder: "Sort by",
          value: sort,
          onChange: (v) => { setSort(v as "recent" | "name"); setPage(1); },
          options: [
            { label: "Recent", value: "recent" },
            { label: "Name A–Z", value: "name" },
          ],
        }]}
      />

      <div className="mt-6">
        <DataTable<VendorItem>
          columns={columns}
          data={vendors}
          loading={loading}
          page={meta?.page ?? page}
          totalPages={meta?.total_pages ?? 1}
          onPageChange={setPage}
          emptyText="No vendors found"
          onRowClick={(v) => navigate(`/super/vendors/${v.id}`, { state: { vendor: v } })}
        />
      </div>
      <ErrorAlert message={fetchError ?? error} />

    </div>
  );
}
