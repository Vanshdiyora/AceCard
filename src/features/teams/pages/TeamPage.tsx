import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { useNavigate } from "react-router-dom";

import {
  fetchTeam,
  createMember,
  updateMember,
  updatePermissions,
} from "../slice";

import TeamMemberCard from "../components/TeamMemberCard";
import AddMemberModal from "../components/AddMemberModal";
import EditMemberModal from "../components/EditMemberModal";
import PermissionsModal from "../components/PermissionsModal";
import SuspendMemberModal from "../components/SuspendMemberModal";

import PageHeader from "../../../common/components/layout/PageHeader";
import PageFilters from "../../../common/components/layout/PageFilter";

import type { TeamMember } from "../types";

type Filter =
  | "all"
  | "admin"
  | "manager"
  | "sales_rep"
  | "active"
  | "suspended";

export default function TeamPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { members, loading } = useAppSelector((s) => s.team);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const [selected, setSelected] = useState<TeamMember | null>(null);

  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [permOpen, setPermOpen] = useState(false);
  const [suspendOpen, setSuspendOpen] = useState(false);

  /* ---------------- FETCH TEAM ---------------- */
  useEffect(() => {
    dispatch(fetchTeam());
  }, [dispatch]);

  /* ---------------- SAFE FILTERING ---------------- */
  const filtered = (members ?? [])
    .filter(Boolean)
    .filter((m) => {
      if (!m) return false;

      if (filter === "active" && m.status !== "active") return false;
      if (filter === "suspended" && m.status !== "suspended") return false;

      if (
        ["admin", "manager", "sales_rep"].includes(filter) &&
        m.role !== filter
      )
        return false;

      if (!m.name?.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });

  /* ---------------- LOADING STATE ---------------- */
  if (loading) {
    return (
      <div className="p-6 text-gray-500 text-sm">
        Loading team members…
      </div>
    );
  }

  /* ---------------- RENDER ---------------- */
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <PageHeader
        title="Team"
        description="Manage your team members"
        addButtonLabel="Add Member"
        onAdd={() => setAddOpen(true)}
      />

      {/* Filters */}
      <PageFilters
        tabs={[
          { label: "All", value: "all" },
          { label: "Admin", value: "admin" },
          { label: "Manager", value: "manager" },
          { label: "Sales Rep", value: "sales_rep" },
          { label: "Active", value: "active" },
          { label: "Suspended", value: "suspended" },
        ]}
        activeTab={filter}
        onTabChange={(v) => setFilter(v as Filter)}
        onSearch={setSearch}
      />

      {/* Empty State */}
      {filtered.length === 0 && (
        <div className="text-center text-gray-500 text-sm py-12">
          No team members found
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((m) => (
          <TeamMemberCard
            key={m.id}
            member={m}
            onClick={() => navigate(`/admin/team/${m.id}`)}
            onEdit={() => {
              setSelected(m);
              setEditOpen(true);
            }}
            onPermissions={() => {
              setSelected(m);
              setPermOpen(true);
            }}
            onSuspend={() => {
              setSelected(m);
              setSuspendOpen(true);
            }}
          />

        ))}
      </div>

      {/* ---------------- MODALS ---------------- */}

      <AddMemberModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSubmit={(data) => {
          dispatch(createMember(data));
          setAddOpen(false);
        }}
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
        onConfirm={(status: any) => {
          if (!selected) return;
          dispatch(
            updateMember({
              id: selected.id,
              data: { status },
            })
          );
          setSuspendOpen(false);
          setSelected(null);
        }}
      />
    </div>
  );
}
