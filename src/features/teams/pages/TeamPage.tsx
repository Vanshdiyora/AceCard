import { useEffect, useState, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { useNavigate } from "react-router-dom";

import {
  fetchTeam,
  createMember,
  updateMember,
  updatePermissions,
} from "../slice";

import AddMemberModal from "../components/AddMemberModal";
import EditMemberModal from "../components/EditMemberModal";
import PermissionsModal from "../components/PermissionsModal";

import PageHeader from "../../../common/components/layout/PageHeader";
import PageFilters from "../../../common/components/layout/PageFilter";
import DataTable, { type Column } from "../../../common/components/table/DataTable";
import ErrorAlert from "../../../common/ui/ErrorAlert";
import BlockingLoader from "../../../common/ui/BlockingLoader";
import ResultModal from "../../../common/ui/ResultModal";

import type { TeamMember } from "../types";

type UserRole = "vendor_admin" | "manager" | "sales_rep";
type RoleFilter = "all" | "manager" | "sales_rep";
type StatusFilter = "all" | "active" | "suspended";
export default function TeamPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { members = [], loading, meta, error: fetchError } = useAppSelector((s) => s.team);
  const authState = useAppSelector((s) => s.auth);

  const ROLES: readonly UserRole[] = ["vendor_admin", "manager", "sales_rep"];
  const rawRole = authState?.role ?? "";
  const currentRole: UserRole = ROLES.includes(rawRole as UserRole)
    ? (rawRole as UserRole)
    : "sales_rep";

  const currentUserId = authState?.user?.user_id;
const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [search, setSearch] = useState("");

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const selected = useMemo(
    () => members.find((m) => m.id === selectedId) || null,
    [members, selectedId]
  );

  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [permOpen, setPermOpen] = useState(false);

  const [blocking, setBlocking] = useState(false);
  const [resultOpen, setResultOpen] = useState(false);
  const [resultSuccess, setResultSuccess] = useState(true);
  const [resultMessage, setResultMessage] = useState("");

  const showResult = (success: boolean, message: string) => {
    setResultSuccess(success);
    setResultMessage(message);
    setResultOpen(true);
  };

  const managers = useMemo(() => members.filter((m) => m.role === "manager"), [members]);

useEffect(() => {
  const params: any = { page, page_size: pageSize };

  if (search) params.search = search;
  if (roleFilter !== "all") params.role = roleFilter;
  if (statusFilter !== "all") params.status = statusFilter;

  dispatch(fetchTeam(params));
}, [dispatch, page, pageSize, search, roleFilter, statusFilter]);


  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);


  const lockScroll = () => {
    const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
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
    const isAnyModalOpen = addOpen || editOpen || permOpen || resultOpen;

    if (isAnyModalOpen) {
      lockScroll();
    } else {
      unlockScroll();
    }

    return () => {
      unlockScroll();
    };
  }, [addOpen, editOpen, permOpen, resultOpen]);

  const columns: Column<TeamMember>[] = [
    { header: "Name", accessor: "name" },
    { header: "Email", width: "2fr", accessor: "email" },
    {
      header: "Status",
      align: "center",
      render: (m) => (
        <span
          className={`px-2 py-1 rounded text-xs ${m.status === "active"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
            }`}
        >
          {m.status}
        </span>
      ),
    },
    { header: "Role", align: "right", render: (m) => m.role.replace("_", " ") },
    {
      header: "Manager",
      align: "right",
      render: (m) => managers.find((mgr) => mgr.id === m.manager_id)?.name ?? "NA",
    },
    { header: "Leads", align: "right", render: (m) => m.leads ?? 0 },
    {
      header: "Permissions",
      align: "right",
      render: (m) => (
        <button
          className="text-purple-600 text-sm hover:underline"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedId(m.id);
            setPermOpen(true);
          }}
        >
          View
        </button>
      ),
    },
  ];

  const finalMembers = members;

  return (
    <div className="p-6">
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
        onAdd={() => setAddOpen(true)}
      />

      <ErrorAlert message={fetchError} />

      <PageFilters
  tabs={[
    { label: "All", value: "all" },
    { label: "Active", value: "active" },
    { label: "Suspended", value: "suspended" },
  ]}
  activeTab={roleFilter !== "all" ? roleFilter : statusFilter}
  onTabChange={(v) => {
    if (v === "manager" || v === "sales_rep") {
      setRoleFilter(v as RoleFilter);
      setStatusFilter("all");
    } else if (v === "active" || v === "suspended") {
      setStatusFilter(v as StatusFilter);
      setRoleFilter("all");
    } else {
      setRoleFilter("all");
      setStatusFilter("all");
    }
  }}
  onSearch={setSearch}
/>


      <div className="mt-6">
        <DataTable
          columns={columns}
          data={finalMembers}
          loading={loading}
          page={meta?.page ?? page}
          totalPages={meta?.total_pages ?? 1}
          onPageChange={setPage}
          onRowClick={(m) => navigate(`/admin/team/${m.id}`, { state: { member: m } })}
        />

      </div>

      <AddMemberModal
        open={addOpen}
        currentRole={currentRole}
        currentUserId={currentUserId}
        managers={managers}
        onClose={() => setAddOpen(false)}
        onSubmit={async (data) => {
          try {
            setBlocking(true);
            await dispatch(createMember(data)).unwrap();
            setAddOpen(false);
            showResult(true, "Team member added successfully.");
          } catch (err: any) { // 🔴 CHANGED
            showResult(false, err || "Failed to add member.");
          } finally {
            setBlocking(false);
          }
        }}
      />

      <EditMemberModal
        open={editOpen}
        member={selected}
        currentRole={currentRole}
        managers={managers}
        onClose={() => {
          setEditOpen(false);
          setSelectedId(null);
        }}
        onSubmit={async (data) => {
          if (!selected) return;
          try {
            setBlocking(true);
            await dispatch(updateMember({ id: selected.id, data })).unwrap();
            setEditOpen(false);
            showResult(true, "Member updated successfully.");
          } catch (err: any) { // 🔴 CHANGED
            showResult(false, err || "Failed to update member.");
          } finally {
            setBlocking(false);
          }
        }}
      />

      <PermissionsModal
        open={permOpen}
        permissions={selected?.permissions || {}}
        role={selected?.role || ""}
        onClose={() => {
          setPermOpen(false);
          setSelectedId(null);
        }}
        onSubmit={async (data) => {
          if (!selected) return;
          try {
            setBlocking(true);
            await dispatch(updatePermissions({ id: selected.id, data })).unwrap();
            setPermOpen(false);
            showResult(true, "Permissions updated successfully.");
          } catch (err: any) { // 🔴 CHANGED
            showResult(false, err || "Failed to update permissions.");
          } finally {
            setBlocking(false);
          }
        }}
      />

      <BlockingLoader show={blocking} />

      <ResultModal
        open={resultOpen}
        success={resultSuccess}
        message={resultMessage}
        onClose={() => setResultOpen(false)}
      />
    </div>
  );
}
