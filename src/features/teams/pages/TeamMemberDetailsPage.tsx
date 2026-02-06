import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo, useRef } from "react";
import { ArrowLeft, Edit, Shield, UserX, CheckCircle2 } from "lucide-react";
// import { useEffect as usePublicEffect } from "react";
import PublicMobileWebsite from "../../publicProfile/components/MobileWebsite";
import TeamMemberPublicProfileTab from "../components/details/publicProfile/TeamMemberPublicProfileTab";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { updateMember, fetchMemberById, updatePermissions, transferLeads } from "../slice";
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
// import MemberMobileWebsite from "../components/MemberMobileWebsite";
import { fetchLeads } from "../../leads/slice"; // adjust path
import {
  normalizeProfile,
  denormalizeProfile,
} from "../../publicProfile/utils/normalizeProfile";

const TABS = [
  "overview",
  "leads",
  "total-leads",
  "analytics",      // 👈 NEW
  "public-profile",
] as const;


export default function TeamMemberDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const phoneScrollRef = useRef<HTMLDivElement>(null);
  const [livePreviewConfig, setLivePreviewConfig] = useState<any | null>(null);
  const [isCropping, setIsCropping] = useState(false); // 👈 ADD

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


  const member = useAppSelector(
    (s) => s.team.members.find((m) => m.id === Number(id)) || null
  );


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

  const [transferOpen, setTransferOpen] = useState(false);
  // const [pendingSuspend, setPendingSuspend] = useState(false);


  const showResult = (success: boolean, message: string) => {
    setResultSuccess(success);
    setResultMessage(message);
    setResultOpen(true);
  };

  /* ---------------- SAFE MEMOS (NO CONDITIONAL HOOKS) ---------------- */

  const displayRole = useMemo(() => {
    if (!member) return "";

    switch (member.role) {
      case "sales_rep":
        return "Sales Person";   // 👈 changed
      case "manager":
        return "Manager";         // 👈 explicit
      case "vendor_admin":
        return "Vendor Admin";
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
      dispatch(
        loadProfileViewByUsername({
          username: member.username,
        })
      );
    }
  }, [member?.username, dispatch]);

  useEffect(() => {
    if (!id) return;

    setHasFetched(false);
    dispatch(fetchMemberById(Number(id)))
      .finally(() => setHasFetched(true));
  }, [id, dispatch]);

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

  const mergedProfile = useMemo(() => {
    if (!publicProfile) return null;

    // 🔥 normalize base once
    const normalizedBase = normalizeProfile(publicProfile);

    if (!livePreviewConfig) {
      return denormalizeProfile(normalizedBase, publicProfile);
    }

    return denormalizeProfile(
      {
        ...normalizedBase,
        ...livePreviewConfig,
      },
      publicProfile
    );
  }, [publicProfile, livePreviewConfig]);

    const displayRoleWithCustom = useMemo(() => {
    if (!member) return "";

    const base = displayRole;
    const custom = member.custom_job_role?.trim();

    if (!custom) return base;

    return `${base} (${custom})`;
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

  const handleTransferAndSuspend = async (toId: number) => {
    try {
      setProcessing(true);

      await dispatch(
        transferLeads({
          from_rep_id: member.id,
          to_rep_id: toId,
          lead_ids: leadIds,
        })
      ).unwrap();

      await dispatch(
        updateMember({
          id: member.id,
          data: { status: "suspended" },
        })
      ).unwrap();

      showResult(true, "Leads transferred & member suspended.");
    } catch {
      showResult(false, "Transfer failed.");
    } finally {
      setProcessing(false);
      setTransferOpen(false);
      setLeadIds([]);
    }
  };

  const avatarUrl = member.avatar || null;


  const Avatar = ({
    src,
    name,
  }: {
    src?: string | null;
    name: string;
  }) => {
    return (
      <div className="h-14 w-14 rounded-full overflow-hidden flex items-center justify-center bg-purple-600 text-white font-semibold text-lg border">
        {src ? (
          <img
            src={src}
            alt={name}
            className="h-full w-full object-cover"
          />
        ) : (
          name.charAt(0).toUpperCase()
        )}
      </div>
    );
  };

  /* ---------------- UI ---------------- */
  return (
    <div
      className={`pt-6 px-6 grid grid-cols-1 gap-6 h-[calc(100vh-64px)]
        transition-[grid-template-columns] duration-500 ease-in-out
        ${activeTab === "public-profile"
          ? "lg:grid-cols-[720px_1fr]"
          : "lg:grid-cols-[1fr_320px]"
        }
      `}
    >

      {/* LEFT */}
      <div
        className={`
          h-full overflow-y-auto overscroll-contain pr-2
          transition-all duration-500 ease-in-out
          ${activeTab === "public-profile"
            ? "lg:order-2"
            : "lg:order-1"
          }
        `}
      >

        {activeTab !== "public-profile" && (<button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-black mb-6"
        >
          <ArrowLeft size={16} />
          Back to Team
        </button>)}

        {activeTab !== "public-profile" && (<DetailPageHeader
          title={member.name}
          subtitle={
            displayManager
              ? `${displayRoleWithCustom} • Manager - ${displayManager}`
              : displayRoleWithCustom
          }

          avatar={
            <Avatar
              src={avatarUrl}
              name={member.name}
            />
          }

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
                onClick={async () => {
                  if (member.status === "active") {
                    try {
                      setProcessing(true);

                      // 👇 get leads directly from API response
                      const res = await dispatch(
                        fetchLeads({
                          page: 1,
                          pageSize: 1000000,
                          memberId: member.id,
                        })
                      ).unwrap();
                      const ids = res.data.map((l: any) => l.id); // 🔴 FIX

                      if (ids.length > 0) {
                        setLeadIds(ids);
                        setTransferOpen(true); // 👈 modal opens now
                      } else {
                        setSuspendMode("suspend");
                        setConfirmOpen(true);
                      }
                    } catch {
                      showResult(false, "Failed to load leads");
                    } finally {
                      setProcessing(false);
                    }
                  } else {
                    setSuspendMode("activate");
                    setConfirmOpen(true);
                  }
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
        />)}

        {activeTab !== "public-profile" && (<div className="flex gap-6 border-b text-sm mt-6">
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
        </div>)}

        {activeTab === "public-profile" && (
          <LeftPulloutTabs
            tabs={TABS}
            activeTab={activeTab}
            onChange={setActiveTab}
            allowTotalLeads={member.role === "manager"}
            navigate={navigate}
          />
        )}

        {activeTab === "overview" && (
          <TeamMemberOverviewTab member={member} />
        )}
        {activeTab === "leads" && (
          <TeamMemberLeadsTab memberId={member.id} />
        )}
        {activeTab === "total-leads" && member.role === "manager" && (
          <TeamMemberTotalLeadsTab managerId={member.id} />
        )}
        {activeTab === "analytics" && (
          <TeamMemberAnalyticsTab memberId={member.id} />
        )}
        {activeTab === "public-profile" && (
          <div className="">
            <div className="h-[95%] overflow-hidden rounded-2xl bg-white overflow-y-auto">
              <TeamMemberPublicProfileTab
                key={member.username}
                onLiveChange={(cfg) => setLivePreviewConfig(cfg)}
                onCropToggle={setIsCropping}   // 👈 ADD
              />
            </div>
          </div>
        )}


      </div>

      {/* RIGHT — MOBILE PREVIEW */}
      <div
        className={`
          hidden lg:flex h-full justify-center items-start overflow-hidden
          transition-all duration-500 ease-in-out
          ${activeTab === "public-profile"
            ? "lg:order-1"
            : "lg:order-2"
          }
          ${isCropping ? "opacity-0 pointer-events-none" : "opacity-100"}
        `}
      >
        {/* Preview container to visually separate from dashboard */}
        <div className="relative h-full flex items-start justify-center px-4">

          {/* Optional label (helps hierarchy a LOT) */}
          <div className="absolute -top-6 text-xs text-gray-400 tracking-wide">
            Live Preview
          </div>

          {/* SCALE WRAPPER */}
          <div className="origin-top scale-[0.6] xl:scale-[0.7]">

            {/* DEVICE FRAME */}
            <div
              className="
                w-[390px] h-[844px]
                rounded-[44px]
                bg-white
                p-[10px]
              "
            >
              {/* DEVICE SCREEN */}
              <div
                className="
                  w-full h-full
                  bg-white
                  rounded-[36px]
                  overflow-hidden
                  flex flex-col
                "
              >
                <div
                  ref={phoneScrollRef}
                  className="flex-1 overflow-y-auto overscroll-contain no-scrollbar"
                >
                  {mergedProfile ? (
                    <PublicMobileWebsite
                      data={mergedProfile}
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

      {/* MODALS */}
      <EditMemberModal
        open={editOpen}
        member={member}
        currentRole={currentRole}
        managers={managers}
        onClose={() => setEditOpen(false)}
        onSubmit={async (data) => {
          const updated = await dispatch(
            updateMember({ id: member.id, data })
          ).unwrap();

          return updated; // 👈 return to modal
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

      <TransferLeadsModal
        open={transferOpen}
        leads={leadIds}
        currentId={member.id}
        // managers={members.filter(m => m.id !== member.id)} // keep this
        loading={processing}
        onClose={() => setTransferOpen(false)}
        onConfirm={handleTransferAndSuspend}
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
            h-full
            w-full
            bg-gradient-to-b from-purple-600 to-purple-700
            rounded-r-2xl
            shadow-xl
            overflow-hidden
          "
        >
          {/* Expanded content */}
          <div
            className="
              opacity-0
              group-hover:opacity-100
              transition-opacity
              duration-200
              delay-100
              h-full
              px-4
              py-6
              text-white
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
                .filter(
                  (t) => t !== "total-leads" || allowTotalLeads
                )
                .map((t) => {
                  const active = activeTab === t;

                  return (
                    <button
                      key={t}
                      onClick={() => onChange(t)}
                      className={`
                        text-left px-3 py-2 rounded-lg capitalize
                        transition-colors
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
