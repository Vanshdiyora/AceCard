import { useEffect, useState, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { useNavigate, useSearchParams } from "react-router-dom";

import {
  fetchTeam,
  createMember,
  updateMember,
  updatePermissions,
} from "../slice";

import AddMemberModal from "../components/AddMemberModal";
import EditMemberModal from "../components/EditMemberModal";
import PermissionsModal from "../components/PermissionsModal";
import SuspendMemberModal from "../components/SuspendMemberModal";

import PageHeader from "../../../common/components/layout/PageHeader";
import PageFilters from "../../../common/components/layout/PageFilter";
import DataTable, { type Column } from "../../../common/components/table/DataTable";

import type { TeamMember } from "../types";

/* ---------------- TYPES ---------------- */

type Filter =
  | "all"
  | "vendor_admin"
  | "manager"
  | "sales_rep"
  | "active"
  | "suspended";

type UserRole = "vendor_admin" | "manager" | "sales_rep";

/* ---------------- COMPONENT ---------------- */

export default function TeamPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const { members = [], loading } = useAppSelector((s) => s.team);
  const authState = useAppSelector((s) => s.auth);

  const ROLES: readonly UserRole[] = ["vendor_admin", "manager", "sales_rep"];
  const rawRole = authState?.role ?? "";
  const currentRole: UserRole = ROLES.includes(rawRole as UserRole)
    ? (rawRole as UserRole)
    : "sales_rep";

  const currentUserId = authState?.user?.user_id;

  const canCreateManager = currentRole === "vendor_admin";
  const canCreateSalesRep =
    currentRole === "vendor_admin" || currentRole === "manager";

  const managers = useMemo(
    () => members.filter((m) => m.role === "manager"),
    [members]
  );

  const managerMap = useMemo(() => {
    const map = new Map<number, string>();
    managers.forEach((m) => map.set(m.id, m.name));
    return map;
  }, [managers]);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [selected, setSelected] = useState<TeamMember | null>(null);

  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [permOpen, setPermOpen] = useState(false);
  const [suspendOpen, setSuspendOpen] = useState(false);

  const isAnyModalOpen = addOpen || editOpen || permOpen || suspendOpen;

  useEffect(() => {
    if (isAnyModalOpen) {
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
    }
  }, [isAnyModalOpen]);

  useEffect(() => {
    dispatch(fetchTeam());
  }, [dispatch]);

  useEffect(() => {
    if (params.get("open") === "create" && (canCreateManager || canCreateSalesRep)) {
      setAddOpen(true);
    }
  }, [params, canCreateManager, canCreateSalesRep]);

  const filtered = useMemo(() => {
    return members.filter((m) => {
      if (!m) return false;

      if (filter === "active" && m.status !== "active") return false;
      if (filter === "suspended" && m.status !== "suspended") return false;

      if (
        ["vendor_admin", "manager", "sales_rep"].includes(filter) &&
        m.role !== filter
      )
        return false;

      if (!m.name?.toLowerCase().includes(search.toLowerCase())) return false;

      return true;
    });
  }, [members, filter, search]);

const columns: Column<TeamMember>[] = [
  { header: "Name", accessor: "name", width: "minmax(160px, 1.5fr)" },
  { header: "Email", accessor: "email", width: "minmax(220px, 2fr)" },
  {
    header: "Status",
    width: "minmax(120px, 1fr)",
    render: (m) => (
      <span className={`px-2 py-1 rounded text-xs ${
        m.status === "active"
          ? "bg-green-100 text-green-700"
          : "bg-red-100 text-red-700"
      }`}>
        {m.status}
      </span>
    ),
  },
  {
    header: "Role",
    width: "minmax(140px, 1.2fr)",
    render: (m) => m.role.replace("_", " "),
  },
  {
    header: "Manager",
    width: "minmax(160px, 1.5fr)",
    render: (m) =>
      m.manager_id ? managerMap.get(m.manager_id) ?? "—" : "—",
  },
  {
    header: "Leads",
    width: "minmax(90px, 0.8fr)",
    align: "right",
    render: (m) => m.leads_count ?? 0,
  },
  {
    header: "Last Active",
    width: "minmax(140px, 1.2fr)",
    align: "right",
    render: (m) =>
      m.last_active_at
        ? new Date(m.last_active_at).toLocaleDateString()
        : "—",
  },
  // {
  //   header: "Permissions",
  //   width: "minmax(120px, 1fr)",
  //   align: "right",
  //   render: (m) => (
  //     <button
  //       className="text-purple-600 text-sm hover:underline"
  //       onClick={(e) => {
  //         e.stopPropagation();
  //         setSelected(m);
  //         setPermOpen(true);
  //       }}
  //     >
  //       View
  //     </button>
  //   ),
  // },
];



  if (loading) {
    return <div className="p-6 text-gray-500 text-sm">Loading team members…</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Team"
        description="Manage your team members"
        addButtonLabel={
          currentRole === "vendor_admin"
            ? "Add Member"
            : currentRole === "manager"
            ? "Add Sales Rep"
            : undefined
        }
        onAdd={() => {
          if (!canCreateManager && !canCreateSalesRep) return;
          setAddOpen(true);
        }}
      />

      <PageFilters
        tabs={[
          { label: "All", value: "all" },
          { label: "Admin", value: "vendor_admin" },
          { label: "Manager", value: "manager" },
          { label: "Sales Rep", value: "sales_rep" },
          { label: "Active", value: "active" },
          { label: "Suspended", value: "suspended" },
        ]}
        activeTab={filter}
        onTabChange={(v) => setFilter(v as Filter)}
        onSearch={setSearch}
      />

      <DataTable
        columns={columns}
        data={filtered}
        emptyText="No team members found"
        onRowClick={(m) => navigate(`/admin/team/${m.id}`)}
      />

      {/* Modals */}
      <AddMemberModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSubmit={(data) => {
          dispatch(createMember(data));
          setAddOpen(false);
        }}
        currentRole={currentRole}
        currentUserId={currentUserId}
        managers={managers}
      />

      <EditMemberModal
        open={editOpen}
        member={selected}
        onClose={() => {
          setEditOpen(false);
          setSelected(null);
        }}
        onSubmit={(data) => {
          if (!selected) return;
          dispatch(updateMember({ id: selected.id, data }));
          setEditOpen(false);
          setSelected(null);
        }}
        currentRole={currentRole}
        managers={managers}
      />

      <PermissionsModal
        open={permOpen}
        permissions={selected?.permissions}
        onClose={() => {
          setPermOpen(false);
          setSelected(null);
        }}
        onSubmit={(data) => {
          if (!selected) return;
          dispatch(updatePermissions({ id: selected.id, data }));
          setPermOpen(false);
          setSelected(null);
        }}
      />

      <SuspendMemberModal
        open={suspendOpen}
        member={selected}
        onClose={() => {
          setSuspendOpen(false);
          setSelected(null);
        }}
        onConfirm={(status:any) => {
          if (!selected) return;
          dispatch(updateMember({ id: selected.id, data: { status } }));
          setSuspendOpen(false);
          setSelected(null);
        }}
      />
    </div>
  );
}
