import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { ArrowLeft, Edit, Shield, UserX, CheckCircle2 } from "lucide-react";

import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { updateMember, fetchMemberById, updatePermissions } from "../slice";

import EditMemberModal from "../components/EditMemberModal";
import PermissionsModal from "../components/PermissionsModal";
import SuspendMemberModal from "../components/SuspendMemberModal";

import TeamMemberOverviewTab from "../components/details/TeamMemberOverviewTab";
import TeamMemberLeadsTab from "../components/details/TeamMemberLeadsTab";
import BrandLoader from "../../../common/ui/BrandLoader";
import type { TeamMember } from "../types";

const TABS = ["overview", "leads"] as const;

export default function TeamMemberDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();

  const auth = useAppSelector((s) => s.auth);
  const { members, loading } = useAppSelector((s) => s.team);

  const ROLES = ["vendor_admin", "manager", "sales_rep"] as const;
  const rawRole = auth?.role ?? "";
  const currentRole = ROLES.includes(rawRole as any)
    ? (rawRole as "vendor_admin" | "manager" | "sales_rep")
    : "sales_rep";

  const managers = useMemo(
    () => members.filter((m) => m.role === "manager"),
    [members]
  );

  const preloaded = (location.state as { member?: TeamMember })?.member;

  const member = useMemo(() => {
    return (
      members.find((m) => m.id === Number(id)) ||
      (preloaded && preloaded.id === Number(id) ? preloaded : null)
    );
  }, [members, id, preloaded]);

  const [activeTab, setActiveTab] = useState<typeof TABS[number]>("overview");
  const [editOpen, setEditOpen] = useState(false);
  const [permOpen, setPermOpen] = useState(false);
  const [suspendOpen, setSuspendOpen] = useState(false);
  const [suspendMode, setSuspendMode] = useState<"suspend" | "activate">("suspend");
  const [suspending, setSuspending] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  /* Fetch only if missing */
  useEffect(() => {
    if (id && !member) {
      dispatch(fetchMemberById(Number(id))).finally(() => setHasFetched(true));
    } else {
      setHasFetched(true);
    }
  }, [id, member, dispatch]);

  /* Scroll lock */
  useEffect(() => {
    const lock = editOpen || permOpen || suspendOpen;
    document.body.style.overflow = lock ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [editOpen, permOpen, suspendOpen]);

  /* Loading */
  if (!hasFetched || (loading && !member)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <BrandLoader message="Loading member..." />
      </div>
    );
  }

  /* Not found */
  if (!member) {
    return (
      <div className="min-h-screen p-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-black mb-4"
        >
          <ArrowLeft size={16} />
          Back to Team
        </button>
        <div className="text-red-500">Member not found</div>
      </div>
    );
  }

  /* Status change */
  const handleStatusChange = async () => {
    try {
      setSuspending(true);
      await dispatch(
        updateMember({
          id: member.id,
          data: { status: suspendMode === "suspend" ? "suspended" : "active" },
        })
      ).unwrap();
    } finally {
      setSuspending(false);
      setSuspendOpen(false);
    }
  };

  return (
    <div className="p-6">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-black"
      >
        <ArrowLeft size={16} />
        Back to Team
      </button>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 bg-white rounded-2xl p-6 border mt-6">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-xl font-semibold">
            {member.name.slice(0, 1).toUpperCase()}
          </div>

          <div>
            <h2 className="text-xl font-semibold leading-tight">{member.name}</h2>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span className="capitalize">{member.role.replace("_", " ")}</span>
              <span>•</span>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  member.status === "active"
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                {member.status}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setEditOpen(true)} className="btn-outline">
            <Edit size={16} /> Edit
          </button>

          <button onClick={() => setPermOpen(true)} className="btn-outline">
            <Shield size={16} /> Permissions
          </button>

          {member.status === "active" ? (
            <button
              onClick={() => {
                setSuspendMode("suspend");
                setSuspendOpen(true);
              }}
              className="btn-danger"
            >
              <UserX size={16} /> Suspend
            </button>
          ) : (
            <button
              onClick={() => {
                setSuspendMode("activate");
                setSuspendOpen(true);
              }}
              className="btn-success"
            >
              <CheckCircle2 size={16} /> Activate
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b text-sm mt-6">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`pb-2 capitalize ${
              activeTab === t
                ? "border-b-2 border-purple-600 text-purple-600 font-medium"
                : "text-gray-500"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {activeTab === "overview" && <TeamMemberOverviewTab member={member} />}
      {activeTab === "leads" && <TeamMemberLeadsTab memberId={member.id} />}

      {/* Modals */}
      <EditMemberModal
        open={editOpen}
        member={member}
        currentRole={currentRole}
        managers={managers}
        onClose={() => setEditOpen(false)}
        onSubmit={async (data) => {
          await dispatch(updateMember({ id: member.id, data })).unwrap();
          setEditOpen(false);
        }}
      />

      <PermissionsModal
        open={permOpen}
        permissions={member.permissions || {}}
        role={member.role}
        onClose={() => setPermOpen(false)}
        onSubmit={async (data) => {
          await dispatch(updatePermissions({ id: member.id, data })).unwrap();
          setPermOpen(false);
        }}
      />

      <SuspendMemberModal
        open={suspendOpen}
        memberName={member.name}
        mode={suspendMode}
        loading={suspending}
        onClose={() => setSuspendOpen(false)}
        onConfirm={handleStatusChange}
      />
    </div>
  );
}
