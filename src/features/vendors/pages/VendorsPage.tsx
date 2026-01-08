import { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import {
  fetchVendors,
  archiveVendor,
} from "../slice";

import PageHeader from "../../../common/components/layout/PageHeader";
import PageFilters from "../../../common/components/layout/PageFilter";

import NotifyVendorModal from "../components/NotifyVendorModal";
import AddVendorModal from "../components/AddVendorModal";
import EditVendorModal from "../components/EditVendorModal";
import UpdateSeatsModal from "../components/UpdateSeatModal";
import ArchiveVendorModal from "../components/ArchiveVendorModal";
import RowActionsDropdown from "../components/RowActionsDropdown";

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

  const [activeTab, setActiveTab] = useState<"active" | "archived">("active");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"recent" | "name">("recent");
  const [showSortDropdown, setShowSortDropdown] = useState(false);

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
      .filter((v) => v.status === activeTab)
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

  return (
    <div className="p-6 space-y-6">

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
          { label: "Active", value: "active" },
          { label: "Archived", value: "archived" },
        ]}
        activeTab={activeTab}
        onTabChange={(v) => {
          if (v === "active" || v === "archived") setActiveTab(v);
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
        onExport={() => console.log("Export CSV")}
        onImport={() => console.log("Import CSV")}
      />


      {showSortDropdown && (
        <div className="bg-white border rounded-xl shadow p-4 w-64">
          <p className="text-sm font-medium mb-2">Sort by</p>

          <button
            onClick={() => {
              setSort("recent");
              setShowSortDropdown(false);
            }}
            className={`block w-full text-left px-3 py-2 rounded-lg text-sm ${sort === "recent"
                ? "bg-purple-100 text-purple-700"
                : "hover:bg-gray-100"
              }`}
          >
            Recent
          </button>

          <button
            onClick={() => {
              setSort("name");
              setShowSortDropdown(false);
            }}
            className={`block w-full text-left px-3 py-2 rounded-lg text-sm ${sort === "name"
                ? "bg-purple-100 text-purple-700"
                : "hover:bg-gray-100"
              }`}
          >
            Name A–Z
          </button>
        </div>
      )}

      <div className="bg-white p-5 rounded-xl shadow overflow-x-auto overflow-y-visible">


        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-gray-600">
              <th className="py-3 text-left">Vendor Name</th>
              <th className="text-left">Vendor Email</th>
              <th className="text-left">Vendor Phone</th>
              <th className="text-left">Vendor GST</th>
              <th className="text-left">Seats</th>
              <th className="text-left">Vendor Status</th>
              <th className="text-left">Stage</th>
              <th className="text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((v) => (
              <tr key={v.id} className="border-b">
                <td className="py-3">{v.legal_name}</td>
                <td>{v.primary_email}</td>
                <td>{v.primary_phone}</td>
                <td>{v.gst || "-"}</td>
                <td>{v.seats_appointed}</td>

                <td>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${v.status === "active"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                      }`}
                  >
                    {v.status === "active" ? "Active" : "Inactive"}
                  </span>
                </td>

                <td className="font-medium">{deriveStage(v)}</td>

                <td>
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
