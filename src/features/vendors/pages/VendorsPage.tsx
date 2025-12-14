import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import {
  fetchVendors,
  archiveVendor,
} from "../slice";

import {
  Users,
  Clock,
  CheckCircle2,
  Archive,
} from "lucide-react";

import PageHeader from "../../../common/components/layout/PageHeader";
import PageFilters from "../../../common/components/layout/PageFilter";
import StatsGrid from "../../../common/components/cards/StatsGrid";

import NotifyVendorModal from "../components/NotifyVendorModal";
import AddVendorModal from "../components/AddVendorModal";
import EditVendorModal from "../components/EditVendorModal";
import UpdateSeatsModal from "../components/UpdateSeatModal";
import ArchiveVendorModal from "../components/ArchiveVendorModal";
import RowActionsDropdown from "../components/RowActionsDropdown";

export default function VendorsPage() {
  const dispatch = useAppDispatch();
  const { stats, vendors } = useAppSelector((s) => s.vendors);

  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");

  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [seatsOpen, setSeatsOpen] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [notifyOpen, setNotifyOpen] = useState(false);

  const [selectedVendor, setSelectedVendor] = useState<any>(null);

  const iconMap: Record<
    "users" | "clock" | "check-circle" | "archive",
    React.ReactNode
  > = {
    users: <Users className="text-purple-600" />,
    clock: <Clock className="text-yellow-500" />,
    "check-circle": <CheckCircle2 className="text-green-600" />,
    archive: <Archive className="text-red-500" />,
  };

  // Fetch vendor list
  useEffect(() => {
    dispatch(fetchVendors());
  }, []);

  // Filter vendors
  const filtered = vendors.filter((v) => {
    const searchMatch =
      v.legal_name.toLowerCase().includes(search.toLowerCase()) ||
      v.primary_email.toLowerCase().includes(search.toLowerCase());

    const tabMatch =
      tab === "all"
        ? true
        : tab === "active"
        ? v.status === "active"
        : tab === "pending"
        ? v.status === "pending"
        : v.status === "archived";

    return searchMatch && tabMatch;
  });

  return (
    <div className="p-6 flex flex-col gap-8">

      {/* HEADER */}
      <PageHeader
        title="Vendor Management"
        description="Manage vendor onboarding & verification"
        addButtonLabel="Add Vendor"
        onAdd={() => setAddOpen(true)}
      />

      {/* MODALS */}
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
           <NotifyVendorModal
              vendor={selectedVendor}
              open={notifyOpen}
              onClose={() => setNotifyOpen(false)}
            />
        </>
      )}

      {/* STATS */}
      <StatsGrid
        items={stats.map((s) => ({
          title: s.title,
          value: s.value,
          change: s.change,
          positive: s.positive,
          icon: iconMap[s.icon],
        }))}
      />

      {/* FILTERS */}
      <PageFilters
        tabs={[
          { label: "All", value: "all" },
          { label: "Pending", value: "pending" },
          { label: "Active", value: "active" },
          { label: "Archived", value: "archived" },
        ]}
        activeTab={tab}
        onTabChange={(v) => setTab(v)}
        onSearch={(v) => setSearch(v)}
      />

      {/* TABLE */}
      <div className="bg-white p-5 rounded-xl shadow">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-gray-600">
              <th className="py-3">Vendor</th>
              <th>Email</th>
              <th>Phone</th>
              <th>GST</th>
              <th>Seats</th>
              <th>Status</th>
              <th>Joined</th>
              <th>Actions</th>
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
                    className={`px-2 py-1 rounded-full text-xs ${
                      v.status === "active"
                        ? "bg-green-100 text-green-600"
                        : v.status === "pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {v.status}
                  </span>
                </td>

                <td>{v.created_at.split("T")[0]}</td>

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
                    onArchive={() => {
                      setSelectedVendor(v);
                      setArchiveOpen(true);
                    }}
                    onNotify={() => {
                      setSelectedVendor(v);
                      setNotifyOpen(true);
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
