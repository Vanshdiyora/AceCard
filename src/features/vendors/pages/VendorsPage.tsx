import { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { fetchVendors, archiveVendor } from "../slice";

import PageHeader from "../../../common/components/layout/PageHeader";
import PageFilters from "../../../common/components/layout/PageFilter";
import DataTable, { type Column } from "../../../common/components/table/DataTable";

import NotifyVendorModal from "../components/NotifyVendorModal";
import AddVendorModal from "../components/AddVendorModal";
import EditVendorModal from "../components/EditVendorModal";
import UpdateSeatsModal from "../components/UpdateSeatModal";
import ArchiveVendorModal from "../components/ArchiveVendorModal";
import RowActionsDropdown from "../components/RowActionsDropdown";
import { useNavigate } from "react-router-dom";

import type { VendorItem } from "../types";

/* ---------------- HELPERS ---------------- */

function deriveStage(v: VendorItem): string {
  switch (v.status) {
    case "pending":
      return "Not Started";
    case "active":
      return "On-boarded";
    case "archived":
      return "In Progress";
    default:
      return "In Progress";
  }
}

/* ---------------- COMPONENT ---------------- */

export default function VendorsPage() {
  const dispatch = useAppDispatch();
  const { vendors } = useAppSelector((s) => s.vendors);
  const navigate = useNavigate();

const [activeTab, setActiveTab] = useState<"all" | "active" | "archived">("all");

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"recent" | "name">("recent");

  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [seatsOpen, setSeatsOpen] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [notifyOpen, setNotifyOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<VendorItem | null>(null);

  useEffect(() => {
    dispatch(fetchVendors());
  }, [dispatch]);

  const filtered = useMemo(() => {
    return vendors
   .filter((v) => activeTab === "all" || v.status === activeTab)
      .filter((v) => {
        const q = search.toLowerCase();
        return (
          v.legal_name.toLowerCase().includes(q) ||
          v.primary_email.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        if (sort === "name") {
          return a.legal_name.localeCompare(b.legal_name);
        }
        return (
          new Date(b.created_at).getTime() -
          new Date(a.created_at).getTime()
        );
      });
  }, [vendors, activeTab, search, sort]);

  const columns: Column<VendorItem>[] = [
    { header: "Vendor Name", accessor: "legal_name", width: "2fr" },
    { header: "Vendor Email", accessor: "primary_email", width: "2fr" },
    { header: "Vendor Phone", accessor: "primary_phone", width: "1.5fr" },
    {
      header: "Vendor GST",
      width: "1.5fr",
      render: (v) => v.gst || "—",
    },
    {
      header: "Seats",
      accessor: "seats_appointed",
      align: "center",
      width: "1fr",
    },
    {
      header: "Vendor Status",
      width: "1.5fr",
      render: (v) => (
        <span
          className={`px-2 py-1 rounded-full text-xs ${v.status === "active"
              ? "bg-green-100 text-green-700"
              : "bg-gray-100 text-gray-600"
            }`}
        >
          {v.status === "active" ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      header: "Stage",
      width: "1.5fr",
      render: (v) => <span className="font-medium">{deriveStage(v)}</span>,
    },
    {
      header: "Actions",
      width: "1fr",
      align: "right",
      render: (v) => (
        <RowActionsDropdown
          onEdit={() => {
            setSelectedVendor(v);
            setEditOpen(true);
          }}
          onSeats={() => {
            setSelectedVendor(v);
            setSeatsOpen(true);
          }}
          onNotify={() => {
            setSelectedVendor(v);
            setNotifyOpen(true);
          }}
          onArchive={() => {
            setSelectedVendor(v);
            setArchiveOpen(true);
          }}
        />
      ),
    },
  ];

  return (
    <div className="p-6">
      <PageHeader
        title="Vendor Management"
        description="Manage vendor onboarding & verification"
        addButtonLabel="Add Vendor"
        onAdd={() => setAddOpen(true)}
      />

      <AddVendorModal open={addOpen} onClose={() => setAddOpen(false)} />

      {selectedVendor && (
        <>
          <EditVendorModal
            vendor={selectedVendor}
            open={editOpen}
            onClose={() => setEditOpen(false)}
          />
          <UpdateSeatsModal
            vendor={selectedVendor}
            open={seatsOpen}
            onClose={() => setSeatsOpen(false)}
          />
          <NotifyVendorModal
            vendor={selectedVendor}
            open={notifyOpen}
            onClose={() => setNotifyOpen(false)}
          />
          <ArchiveVendorModal
            vendor={selectedVendor}
            open={archiveOpen}
            onClose={() => setArchiveOpen(false)}
            onConfirm={async () => {
              await dispatch(archiveVendor(selectedVendor.id));
              dispatch(fetchVendors());
              setArchiveOpen(false);
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
  if (v === "all" || v === "active" || v === "archived") setActiveTab(v);
}}

        searchPlaceholder="Search vendors..."
        onSearch={setSearch}
        filters={[
          {
            key: "sort",
            placeholder: "Sort by",
            value: sort,
            onChange: (v) => setSort(v as "recent" | "name"),
            options: [
              { label: "Recent", value: "recent" },
              { label: "Name A–Z", value: "name" },
            ],
          },
        ]}
      />

      <div className="mt-6">
        <DataTable<VendorItem>
          columns={columns}
          data={filtered}
          emptyText="No vendors found"
          onRowClick={(v) =>
            navigate(`/super/vendors/${v.id}`, { state: { vendor: v } })
          }

        />
      </div>
    </div>
  );
}
