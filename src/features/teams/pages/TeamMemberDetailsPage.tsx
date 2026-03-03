import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo, useRef } from "react";
import { ArrowLeft, Edit, Shield, UserX, CheckCircle2 } from "lucide-react";
import PublicMobileWebsite from "../../publicProfile/components/MobileWebsite";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { updateMember, fetchMemberById, updatePermissions, transferLeads, unassignManager, transferSalespersons } from "../slice";
import EditMemberModal from "../components/EditMemberModal";
import PermissionsModal from "../components/PermissionsModal";
import { loadProfileViewByUsername } from "../../publicProfile/slice";
import { TransferLeadsModal } from "../components/TransferLeadsModal";
import TeamMemberOverviewTab from "../components/details/TeamMemberOverviewTab";
import TeamMemberLeadsTab from "../components/details/TeamMemberLeadsTab";
import BrandLoader from "../../../common/ui/BrandLoader";
import DetailPageHeader from "../../../common/components/layout/DetailPageHeader";
import ConfirmationModal from "../../../common/ui/ConfirmationModal";
import BlockingLoader from "../../../common/ui/BlockingLoader";
import ResultModal from "../../../common/ui/ResultModal";
import TeamMemberTotalLeadsTab from "../components/details/TeamMemberTotalLeadsTab";
import TeamMemberAnalyticsTab from "../components/details/TeamMemberAnalyticsTab";
import { ActionButton } from "../../vendors/pages/VendorDetailsPage";
import { fetchLeads } from "../../leads/slice";
import {
  normalizeProfile,
  denormalizeProfile,
} from "../../publicProfile/utils/normalizeProfile";
import VicePublicSetting from "../../settings/components/vice/VicePublicSetting";
import { TransferSalespersonsModal } from "../components/TransferSalespersonsModal";

const TABS = [
  "overview",
  "leads",
  "total-leads",
  "analytics",
  "public-profile",
] as const;


export default function TeamMemberDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const phoneScrollRef = useRef<HTMLDivElement>(null);
  const [livePreviewConfig, setLivePreviewConfig] = useState<any | null>(null);
  const [isCropping, setIsCropping] = useState(false);

  const auth = useAppSelector((s) => s.auth);
  const { members } = useAppSelector((s) => s.team);
  const [leadIds, setLeadIds] = useState<number[]>([]);

  const ROLES = ["vendor_admin", "manager", "sales_rep"] as const;
  const rawRole = auth?.role ?? "";
  const currentRole = ROLES.includes(rawRole as any)
    ? (rawRole as "vendor_admin" | "manager" | "sales_rep")
    : "sales_rep";

  const managers = useMemo(
    () => members.filter((m) => m.role === "manager"),
    [members]
  );

  const member = useAppSelector((s) => s.team.selectedMember);

  const [activeTab, setActiveTab] = useState<typeof TABS[number]>("overview");
  const [editOpen, setEditOpen] = useState(false);
  const [permOpen, setPermOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [suspendMode, setSuspendMode] = useState<"suspend" | "activate">("suspend");
  const [processing, setProcessing] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const [transferSalesOpen, setTransferSalesOpen] = useState(false);
  const [resultOpen, setResultOpen] = useState(false);
  const [resultSuccess, setResultSuccess] = useState(true);
  const [resultMessage, setResultMessage] = useState("");
  const { data: publicProfile } = useAppSelector((s) => s.publicProfile);
  const [pendingLeadTransfer, setPendingLeadTransfer] = useState<{
    toId: number | null;
    leadIds: number[];
  } | null>(null);

  const [transferOpen, setTransferOpen] = useState(false);

  const showResult = (success: boolean, message: string) => {
    setResultSuccess(success);
    setResultMessage(message);
    setResultOpen(true);
  };

  /* ---------------- SAFE MEMOS ---------------- */

  const displayRole = useMemo(() => {
    if (!member) return "";
    switch (member.role) {
      case "sales_rep": return "Sales Person";
      case "manager": return "Manager";
      case "vendor_admin": return "Vendor Admin";
      default:
        return member.role
          .replace(/_/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase());
    }
  }, [member]);

  const displayManager = useMemo(() => {
    if (!member) return null;
    if (member.role !== "sales_rep") return null;
    if (!member.manager_id) return null;
    return managers.find((m) => m.id === member.manager_id)?.name || null;
  }, [member, managers]);

  /* ---------------- DATA FETCH ---------------- */
  useEffect(() => {
    if (member?.username) {
      dispatch(loadProfileViewByUsername({ username: member.username }));
    }
  }, [member?.username, dispatch]);

  useEffect(() => {
    if (!id) return;
    setHasFetched(false);
    dispatch(fetchMemberById(Number(id))).finally(() => setHasFetched(true));
  }, [id, dispatch]);

  /* ---------------- SCROLL LOCK ---------------- */
  const lockScroll = () => {
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
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

  const mergedProfile = useMemo(() => {
    if (!publicProfile) return null;
    const normalizedBase = normalizeProfile(publicProfile);
    if (!livePreviewConfig) return denormalizeProfile(normalizedBase, publicProfile);
    return denormalizeProfile({ ...normalizedBase, ...livePreviewConfig }, publicProfile);
  }, [publicProfile, livePreviewConfig]);

  const displayRoleWithCustom = useMemo(() => {
    if (!member) return "";
    const base = displayRole;
    const custom = member.custom_job_role?.trim();
    if (!custom) return base;
    return `${custom} (${base})`;
  }, [member, displayRole]);

  /* ---------------- LOADING STATES ---------------- */
  if (!hasFetched && !member) {
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

  const executeFinalSuspend = async (
    salespersonTransferToId: number | null
  ) => {
    if (!pendingLeadTransfer) return;

    try {
      setProcessing(true);

      // 1️⃣ Transfer Leads
      if (pendingLeadTransfer.leadIds.length > 0) {
        await dispatch(
          transferLeads({
            from_rep_id: member.id,
            to_rep_id: pendingLeadTransfer.toId!,
            lead_ids: pendingLeadTransfer.leadIds,
          })
        ).unwrap();
      }

      // 2️⃣ Suspend Member
      await dispatch(
        updateMember({
          id: member.id,
          data: { status: "suspended" },
        })
      ).unwrap();

      // 3️⃣ If transferring salespersons
      if (salespersonTransferToId) {
        await dispatch(
          transferSalespersons({
            from_manager_id: member.id,
            to_manager_id: salespersonTransferToId,
          })
        ).unwrap();

        showResult(true, "Manager suspended & salespersons transferred.");
      } else {
        // 4️⃣ Call Unassign API
        await dispatch(
          unassignManager({
            member_id: member.id,
          })
        ).unwrap();

        showResult(true, "Manager suspended & salespersons unassigned.");
      }

    } catch (err: any) {
      showResult(false, err || "Operation failed.");
    } finally {
      setProcessing(false);
      setPendingLeadTransfer(null);
      setTransferSalesOpen(false);
    }
  };
  /* ---------------- ACTIONS ---------------- */
  const handleStatusChange = async () => {
    if (suspendMode === "activate") {
      // ✅ Activation can execute immediately
      try {
        setProcessing(true);

        await dispatch(
          updateMember({
            id: member.id,
            data: { status: "active" },
          })
        ).unwrap();

        showResult(true, "Member activated successfully.");
      } catch {
        showResult(false, "Failed to activate member.");
      } finally {
        setProcessing(false);
        setConfirmOpen(false);
      }

      return;
    }

    // 🔥 IF SUSPEND → DO NOT CALL API
    // Just move to Leads modal

    setConfirmOpen(false);

    try {
      setProcessing(true);

      const res = await dispatch(
        fetchLeads({
          page: 1,
          pageSize: 1000000,
          memberId: member.id,
        })
      ).unwrap();

      const ids = res.data.map((l: any) => l.id);

      if (ids.length > 0) {
        setLeadIds(ids);
        setTransferOpen(true);
      } else {
        // No leads → go directly to sales modal
        setPendingLeadTransfer({
          toId: null,
          leadIds: [],
        });

        if (member.role === "manager") {
          setTransferSalesOpen(true);
        } else {
          executeFinalSuspend(null);
        }
      }
    } catch {
      showResult(false, "Failed to load leads.");
    } finally {
      setProcessing(false);
    }
  };

  const avatarUrl = member.avatar || null;

  const Avatar = ({ src, name }: { src?: string | null; name: string }) => (
    <div className="h-14 w-14 rounded-full overflow-hidden flex items-center justify-center bg-purple-600 text-white font-semibold text-lg border">
      {src ? (
        <img src={src} alt={name} className="h-full w-full object-cover" />
      ) : (
        name.charAt(0).toUpperCase()
      )}
    </div>
  );

  const isPublicProfile = activeTab === "public-profile";

  /* ---------------- UI ---------------- */
  return (
    <div
      className={`
    ${isPublicProfile ? "pt-4" : "pt-6"}
    px-4 lg:px-6
    grid grid-cols-1
    gap-6 xl:gap-0
    lg:h-[calc(100vh-64px)]
    transition-all duration-500 ease-in-out
    ${isPublicProfile ? "xl:grid-cols-[1fr_480px]" : "xl:grid-cols-[1fr_320px]"}
  `}
    >

      {/* ── LEFT COLUMN ── */}
      <div
        className={`
          h-full pr-2
          ${isPublicProfile ? "overflow-hidden" : "overflow-y-auto overscroll-contain"}
          transition-all duration-500 ease-in-out
          ${isPublicProfile ? "order-2 lg:order-2" : "order-1 lg:order-1"}
        `}
      >

        {/* Back button — hidden on public-profile (pullout handles it) */}
        {!isPublicProfile && (
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-black mb-6"
          >
            <ArrowLeft size={16} />
            Back to Team
          </button>
        )}

        {/* Header */}
        {!isPublicProfile && (
          <DetailPageHeader
            title={member.name}
            subtitle={
              displayManager
                ? `${displayRoleWithCustom} • Manager - ${displayManager}`
                : displayRoleWithCustom
            }
            avatar={<Avatar src={avatarUrl} name={member.name} />}
            status={{ label: member.status }}
            actions={
              <div className="flex gap-3">
                <ActionButton
                  icon={<Edit size={16} />}
                  label="Edit"
                  onClick={() => setEditOpen(true)}
                />
                <ActionButton
                  icon={<Shield size={16} />}
                  label="Permissions"
                  onClick={() => setPermOpen(true)}
                />
                <ActionButton
                  icon={
                    member.status === "active"
                      ? <UserX size={16} />
                      : <CheckCircle2 size={16} />
                  }
                  label={member.status === "active" ? "Suspend" : "Activate"}
                  onClick={() => {
                    setSuspendMode(
                      member.status === "active" ? "suspend" : "activate"
                    );
                    setConfirmOpen(true);
                  }}
                  danger={member.status === "active"}
                  disabled={processing}
                />
              </div>
            }
          />
        )}

        {/* Tab bar — hidden on public-profile (pullout handles it) */}
        {!isPublicProfile && (
          <div className="flex gap-6 border-b text-sm mt-6">
            {TABS.filter((t) => t !== "total-leads" || member.role === "manager").map((t) => (
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
        )}

        {/* Pullout nav shown only on public-profile tab */}
        {isPublicProfile && (
          <LeftPulloutTabs
            tabs={TABS}
            activeTab={activeTab}
            onChange={setActiveTab}
            allowTotalLeads={member.role === "manager"}
            navigate={navigate}
          />
        )}

        {/* ── TAB CONTENT ── */}
        {activeTab === "overview" && <TeamMemberOverviewTab member={member} />}

        {activeTab === "leads" && <TeamMemberLeadsTab memberId={member.id} />}

        {activeTab === "total-leads" && member.role === "manager" && (
          <TeamMemberTotalLeadsTab managerId={member.id} />
        )}

        {activeTab === "analytics" && <TeamMemberAnalyticsTab memberId={member.id} />}

        {/* Public-profile editor — fills remaining height and scrolls internally */}
        {isPublicProfile && (
          <div
            className="w-full flex gap-8"

          >
            <div
              className="w-full xl:w-[480px] bg-white rounded-2xl shadow-md overflow-hidden flex flex-col"
              style={{ height: "calc(100vh - 84px)" }}
            >
              <div className="flex-1 overflow-y-auto overscroll-contain">
                <VicePublicSetting
                  key={member.username}
                  onLiveChange={(cfg) => setLivePreviewConfig(cfg)}
                  onCropToggle={setIsCropping}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── RIGHT COLUMN — MOBILE PREVIEW ── */}
      <div
        className={`
    ${isPublicProfile ? "flex w-full" : "hidden xl:flex"}
    ${isPublicProfile ? "" : "h-full"}
    justify-center items-start overflow-hidden
    transition-all duration-500 ease-in-out
    ${isPublicProfile ? "order-1 xl:order-1" : "order-2 xl:order-2"}
    ${isCropping ? "opacity-0 pointer-events-none" : "opacity-100"}
  `}
      >
        <div
          className={`
      relative w-full h-min
      flex ${isPublicProfile ? "flex-col items-center" : "items-start justify-center"}
      px-4 mt-8
    `}
        >
          {/* Live Preview label */}
          <div className="absolute -top-8 text-xs text-gray-400 bg-gray-50 tracking-wide border border-[#D5d5d5] rounded-xl px-2 py-1 shadow-md hover:shadow-lg transition-shadow duration-200">
            <a
              href={`${window.location.origin}/profile/${member.username}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Live Preview
            </a>
          </div>

          {/* Scale wrapper */}
          <div className="origin-top scale-[0.6] max-h-[500px] xl:scale-[0.7]">
            <div className="w-[390px] h-[780px] rounded-[44px]">
              <div className="w-full h-full bg-white rounded-[36px] overflow-hidden flex flex-col">
                <div
                  ref={phoneScrollRef}
                  className="flex-1 overflow-y-auto overscroll-contain no-scrollbar"
                >
                  {mergedProfile ? (
                    <PublicMobileWebsite
                      data={mergedProfile}
                      isPreview={true}
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
        </div>
      </div>

      {/* ── MODALS ── */}
      <TransferSalespersonsModal
        open={transferSalesOpen}
        fromManagerId={member.id}

        onClose={() => {
          executeFinalSuspend(null); // ✅ Unassign flow
        }}

        onSuccess={(toManagerId) => {
          executeFinalSuspend(toManagerId); // ✅ Transfer flow
        }}
      />
      <EditMemberModal
        open={editOpen}
        member={member}
        currentRole={currentRole}
        managers={managers}
        onClose={() => setEditOpen(false)}
        onSubmit={async (data) => {
          const updated = await dispatch(updateMember({ id: member.id, data })).unwrap();
          return updated;
        }}
        onSuccess={() => {
          dispatch(fetchMemberById(member.id));
          if (member.username) {
            dispatch(loadProfileViewByUsername({ username: member.username }));
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
        title={suspendMode === "suspend" ? "Suspend Member" : "Activate Member"}
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

      <TransferLeadsModal
        open={transferOpen}
        leads={leadIds}
        currentId={member.id}
        loading={processing}
        onClose={() => setTransferOpen(false)}
        onConfirm={async (toId) => {
          setTransferOpen(false);

          // =========================
          // SALES REP FLOW
          // =========================
          if (member.role === "sales_rep") {
            try {
              setProcessing(true);

              // 1️⃣ Transfer Leads
              if (leadIds.length > 0) {
                await dispatch(
                  transferLeads({
                    from_rep_id: member.id,
                    to_rep_id: toId,
                    lead_ids: leadIds,
                  })
                ).unwrap();
              }

              // 2️⃣ Suspend Immediately
              await dispatch(
                updateMember({
                  id: member.id,
                  data: { status: "suspended" },
                })
              ).unwrap();

              showResult(true, "Sales person suspended & leads transferred.");
            } catch {
              showResult(false, "Operation failed.");
            } finally {
              setProcessing(false);
            }

            return;
          }

          // =========================
          // MANAGER FLOW (unchanged)
          // =========================
          setPendingLeadTransfer({
            toId,
            leadIds,
          });

          setTransferSalesOpen(true);
        }}
      />

      <ResultModal
        open={resultOpen}
        success={resultSuccess}
        message={resultMessage}
        onClose={() => setResultOpen(false)}
      />
    </div>
  );
}

/* ── PULLOUT TABS (shown when on public-profile tab) ── */

type PulloutTabsProps = {
  tabs: readonly string[];
  activeTab: string;
  onChange: (tab: any) => void;
  allowTotalLeads: boolean;
  navigate: (delta: number) => void;
};

export function LeftPulloutTabs({
  tabs,
  activeTab,
  onChange,
  allowTotalLeads,
  navigate,
}: PulloutTabsProps) {
  return (
    <div className="fixed top-0 left-[250px] h-screen z-40 block">
      {/* Hover area */}
      <div
        className="
          group
          h-full
          w-[10px]
          hover:w-[220px]
          transition-all
          duration-300
          ease-out
        "
      >
        {/* Panel */}
        <div
          className="
            h-full w-full
            bg-gradient-to-b from-purple-600 to-purple-700
            rounded-r-2xl shadow-xl overflow-hidden
          "
        >
          {/* Expanded content */}
          <div
            className="
              opacity-0 group-hover:opacity-100
              transition-opacity duration-200 delay-100
              h-full px-4 py-6 text-white
            "
          >
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-sm text-gray-100 hover:text-white mb-6"
            >
              <ArrowLeft size={16} />
              Back to Team
            </button>

            <nav className="flex flex-col gap-2">
              {tabs
                .filter((t) => t !== "total-leads" || allowTotalLeads)
                .map((t) => {
                  const active = activeTab === t;
                  return (
                    <button
                      key={t}
                      onClick={() => onChange(t)}
                      className={`
                        text-left px-3 py-2 rounded-lg capitalize transition-colors
                        ${active
                          ? "bg-white text-purple-700 font-medium"
                          : "text-purple-100 hover:bg-purple-500/30"
                        }
                      `}
                    >
                      {t.replace("-", " ")}
                    </button>
                  );
                })}
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}