import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useMemo, useRef } from "react";
import { ArrowLeft, Edit, Shield, UserX, CheckCircle2 } from "lucide-react";
// import { useEffect as usePublicEffect } from "react";
import PublicMobileWebsite from "../../publicProfile/components/MobileWebsite";
import TeamMemberPublicProfileTab from "../components/details/publicProfile/TeamMemberPublicProfileTab";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { updateMember, fetchMemberById, updatePermissions } from "../slice";
import EditMemberModal from "../components/EditMemberModal";
import PermissionsModal from "../components/PermissionsModal";

import TeamMemberOverviewTab from "../components/details/TeamMemberOverviewTab";
import TeamMemberLeadsTab from "../components/details/TeamMemberLeadsTab";
import BrandLoader from "../../../common/ui/BrandLoader";
import DetailPageHeader from "../../../common/components/layout/DetailPageHeader";
import ConfirmationModal from "../../../common/ui/ConfirmationModal";
import BlockingLoader from "../../../common/ui/BlockingLoader";
import ResultModal from "../../../common/ui/ResultModal";
import TeamMemberTotalLeadsTab from "../components/details/TeamMemberTotalLeadsTab";
// import MemberMobileWebsite from "../components/MemberMobileWebsite";

import type { TeamMember } from "../types";

const TABS = ["overview", "leads", "total-leads", "public-profile"] as const;

export default function TeamMemberDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const phoneScrollRef = useRef<HTMLDivElement>(null);

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
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [suspendMode, setSuspendMode] = useState<"suspend" | "activate">("suspend");
  const [processing, setProcessing] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  const [resultOpen, setResultOpen] = useState(false);
  const [resultSuccess, setResultSuccess] = useState(true);
  const [resultMessage, setResultMessage] = useState("");
  const { data: publicProfile } = useAppSelector(
    (s) => s.publicProfile
  );

  const showResult = (success: boolean, message: string) => {
    setResultSuccess(success);
    setResultMessage(message);
    setResultOpen(true);
  };

  /* ---------------- SAFE MEMOS (NO CONDITIONAL HOOKS) ---------------- */

  const displayRole = useMemo(() => {
    if (!member) return "";
    if (member.role === "sales_rep") return "Sales Person";
    if (member.role === "vendor_admin") return "Vendor Admin";
    if (member.role === "manager") return "Manager";
    return member.role.replace("_", " ");
  }, [member]);

  const displayManager = useMemo(() => {
    if (!member) return null;
    if (member.role !== "sales_rep") return null;
    if (!member.manager_id) return null;
    return managers.find((m) => m.id === member.manager_id)?.name || null;
  }, [member, managers]);

  /* ---------------- DATA FETCH ---------------- */

  useEffect(() => {
    if (id && !member) {
      dispatch(fetchMemberById(Number(id))).finally(() => setHasFetched(true));
    } else {
      setHasFetched(true);
    }
  }, [id, member, dispatch]);

  /* ---------------- SCROLL LOCK ---------------- */

  const lockScroll = () => {
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    document.body.style.paddingRight = `${scrollbarWidth}px`;
  };

  const unlockScroll = () => {
    document.documentElement.style.overflow = "";
    document.body.style.overflow = "";
    document.body.style.paddingRight = "";
  };

  useEffect(() => {
    const lock = editOpen || permOpen || confirmOpen || resultOpen;
    lock ? lockScroll() : unlockScroll();
    return unlockScroll;
  }, [editOpen, permOpen, confirmOpen, resultOpen]);

  /* ---------------- LOADING STATES ---------------- */

  if (!hasFetched || (loading && !member)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <BrandLoader message="Loading member..." />
      </div>
    );
  }

  if (!member) {
    return (
      <div className="flex flex-col h-full">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center mt-6 gap-2 text-sm text-gray-500 hover:text-black"
        >
          <ArrowLeft size={16} />
          Back to Team
        </button>

        <div className="flex flex-1 items-center justify-center text-red-500">
          Member not found
        </div>
      </div>
    );
  }

  /* ---------------- ACTIONS ---------------- */

  const handleStatusChange = async () => {
    try {
      setProcessing(true);
      await dispatch(
        updateMember({
          id: member.id,
          data: {
            status: suspendMode === "suspend" ? "suspended" : "active",
          },
        })
      ).unwrap();

      showResult(
        true,
        suspendMode === "suspend"
          ? "Member suspended successfully."
          : "Member activated successfully."
      );
    } catch {
      showResult(false, "Failed to update member status.");
    } finally {
      setProcessing(false);
      setConfirmOpen(false);
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="p-6 grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-6 h-[calc(100vh-80px)]">
      {/* LEFT */}
      <div className="overflow-y-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-black mb-6"
        >
          <ArrowLeft size={16} />
          Back to Team
        </button>

        <DetailPageHeader
          title={member.name}
          subtitle={
            displayManager
              ? `${displayRole} • Manager - ${displayManager}`
              : displayRole
          }
          avatar={(member.name?.charAt(0) || "S").toUpperCase()}
          status={{
            label: member.status,
            variant: member.status === "active" ? "active" : "suspended",
          }}
          actions={
            <>
              <button onClick={() => setEditOpen(true)} className="btn-outline">
                <Edit size={16} /> Edit
              </button>

              <button onClick={() => setPermOpen(true)} className="btn-outline">
                <Shield size={16} /> Permissions
              </button>

              <button
                onClick={() => {
                  setSuspendMode(
                    member.status === "active" ? "suspend" : "activate"
                  );
                  setConfirmOpen(true);
                }}
                className={
                  member.status === "active" ? "btn-danger" : "btn-success"
                }
              >
                {member.status === "active" ? (
                  <>
                    <UserX size={16} /> Suspend
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={16} /> Activate
                  </>
                )}
              </button>
            </>
          }
        />

        <div className="flex gap-6 border-b text-sm mt-6">
          {TABS.filter(
            (t) => t !== "total-leads" || member.role === "manager"
          ).map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`pb-2 capitalize ${activeTab === t
                ? "border-b-2 border-purple-600 text-purple-600 font-medium"
                : "text-gray-500"
                }`}
            >
              {t.replace("-", " ")}
            </button>
          ))}
        </div>

        {activeTab === "overview" && (
          <TeamMemberOverviewTab member={member} />
        )}
        {activeTab === "leads" && (
          <TeamMemberLeadsTab memberId={member.id} />
        )}
        {activeTab === "total-leads" && member.role === "manager" && (
          <TeamMemberTotalLeadsTab managerId={member.id} />
        )}
        {activeTab === "public-profile" && (
          <div className="mt-6">
            <TeamMemberPublicProfileTab />
          </div>
        )}

      </div>

      {/* RIGHT */}
      <div className="hidden lg:flex justify-center items-center h-full overflow-hidden">
        <div className="w-[340px] max-h-full aspect-[9/19.5] bg-black rounded-[2.5rem] p-2">
          <div className="h-full bg-white rounded-[2rem] overflow-hidden flex flex-col">
            <div
              ref={phoneScrollRef}
              className="flex-1 overflow-y-auto overscroll-contain"
            >
              {publicProfile ? (
                <PublicMobileWebsite
                  data={publicProfile}
                  scrollRef={phoneScrollRef}
                />

              ) : (
                <div className="h-full flex items-center justify-center text-sm text-gray-400">
                  No public profile yet
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* MODALS */}
      <EditMemberModal
        open={editOpen}
        member={member}
        currentRole={currentRole}
        managers={managers}
        onClose={() => setEditOpen(false)}
        onSubmit={async (data) => {
          try {
            setProcessing(true);
            await dispatch(updateMember({ id: member.id, data })).unwrap();
            showResult(true, "Member updated successfully.");
          } catch {
            showResult(false, "Failed to update member.");
          } finally {
            setProcessing(false);
            setEditOpen(false);
          }
        }}
      />

      <PermissionsModal
        open={permOpen}
        permissions={member.permissions || {}}
        role={member.role}
        onClose={() => setPermOpen(false)}
        onSubmit={async (data) => {
          try {
            setProcessing(true);
            await dispatch(updatePermissions({ id: member.id, data })).unwrap();
            showResult(true, "Permissions updated successfully.");
          } catch {
            showResult(false, "Failed to update permissions.");
          } finally {
            setProcessing(false);
            setPermOpen(false);
          }
        }}
      />

      <ConfirmationModal
        open={confirmOpen}
        title={
          suspendMode === "suspend" ? "Suspend Member" : "Activate Member"
        }
        message={
          suspendMode === "suspend"
            ? `Are you sure you want to suspend ${member.name}?`
            : `Are you sure you want to activate ${member.name}?`
        }
        confirmLabel={suspendMode === "suspend" ? "Suspend" : "Activate"}
        confirmVariant={suspendMode === "suspend" ? "danger" : "success"}
        loading={processing}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleStatusChange}
      />

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
