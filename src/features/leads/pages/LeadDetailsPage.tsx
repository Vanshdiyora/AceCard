import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { ArrowLeft, Repeat } from "lucide-react";

import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { fetchLeadById, transferLead } from "../slice";

import LeadOverviewTab from "../components/details/LeadOverviewTab";
import LeadTimelineTab from "../components/details/LeadTimeLineTab";
import LeadNotesTab from "../components/details/LeadNotesTab";
import LeadFollowupsTab from "../components/details/LeadFollowupsTab";
import LeadProductsTab from "../components/details/LeadProductsTab";

import BrandLoader from "../../../common/ui/BrandLoader";
import { TransferLeadsModal } from "../../teams/components/TransferLeadsModal";
import ResultModal from "../../../common/ui/ResultModal";

const TABS = [
  "overview",
  "timeline",
  "notes",
  "followups",
  "products",
] as const;

export default function LeadDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [activeTab, setActiveTab] =
    useState<typeof TABS[number]>("overview");

  const [transferOpen, setTransferOpen] = useState(false);

  // ✅ Result modal state
  const [resultOpen, setResultOpen] = useState(false);
  const [resultSuccess, setResultSuccess] = useState(true);
  const [resultMessage, setResultMessage] = useState("");

  const { leads, loading, transferLoading } = useAppSelector(
    (s) => s.leads
  );

  const lead = leads.find((l) => l.id === Number(id));

  /* -----------------------------
     Fetch Lead
  ------------------------------ */
  useEffect(() => {
    if (id) {
      dispatch(fetchLeadById(Number(id)));
    }
  }, [id, dispatch]);

  /* -----------------------------
     Scroll Lock When Modal Open
  ------------------------------ */
  useEffect(() => {
    if (!transferOpen && !resultOpen) {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      return;
    }

    const scrollY = window.scrollY;

    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.body.style.overflow = "";
      window.scrollTo(0, scrollY);
    };
  }, [transferOpen, resultOpen]);

  /* -----------------------------
     Handle Transfer
  ------------------------------ */
  const handleTransfer = async (toId: number) => {
    if (!lead) return;

    const res = await dispatch(
      transferLead({ id: lead.id, to_rep_id: toId })
    );

    setTransferOpen(false);

    if (transferLead.fulfilled.match(res)) {
      setResultSuccess(true);
      setResultMessage("Lead transferred successfully.");
    } else {
      setResultSuccess(false);
      setResultMessage(
        (res.payload as string) || "Failed to transfer lead."
      );
    }

    setResultOpen(true);
  };

  /* -----------------------------
     Loading State
  ------------------------------ */
  if (loading && !lead) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <BrandLoader message="Loading lead..." />
      </div>
    );
  }

  /* -----------------------------
     Not Found
  ------------------------------ */
  if (!loading && !lead) {
    return (
      <div className="flex flex-col h-full">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center mt-6 gap-2 text-sm text-gray-500 hover:text-black"
        >
          <ArrowLeft size={16} />
          Back to Leads
        </button>
        <div className="flex flex-1 items-center justify-center text-red-500">
          Lead not found
        </div>
      </div>
    );
  }

  if (!lead) return null;

  return (
    <div className="mx-auto p-6">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-xs text-gray-400 hover:text-gray-700 transition mb-6"
      >
        <ArrowLeft size={14} />
        Back to Leads
      </button>

      {/* Header */}
      <div className="bg-white border border-gray-100 rounded-3xl px-6 py-5 shadow-sm flex justify-between items-center mb-6">
        <div className="flex flex-col">
          <span className="text-xs uppercase tracking-wide text-gray-400">
            Lead
          </span>
          <h2 className="text-xl font-semibold text-gray-900">
            {lead.lead_name}
          </h2>
          <span className="text-sm text-gray-500">
            {lead.company}
          </span>
        </div>

        <button
          onClick={() => setTransferOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-2xl 
                     border border-purple-200 
                     bg-purple-50 
                     text-purple-600 
                     text-sm font-medium
                     hover:bg-purple-100 
                     transition"
        >
          <Repeat size={16} />
          Transfer
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b text-sm mb-6">
        {TABS.map((t) => {
          const active = activeTab === t;
          return (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`pb-3 capitalize transition ${active
                  ? "border-b-2 border-purple-600 text-purple-600 font-semibold"
                  : "text-gray-400 hover:text-gray-600"
                }`}
            >
              {t.replace("_", " ")}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div>
        {activeTab === "overview" && (
          <LeadOverviewTab lead={lead} />
        )}
        {activeTab === "timeline" && (
          <LeadTimelineTab leadId={lead.id} />
        )}
        {activeTab === "notes" && (
          <LeadNotesTab leadId={lead.id} />
        )}
        {activeTab === "followups" && (
          <LeadFollowupsTab leadId={lead.id} />
        )}
        {activeTab === "products" && (
          <LeadProductsTab lead={lead} />
        )}
      </div>

      {/* Transfer Modal */}
      <TransferLeadsModal
        open={transferOpen}
        leads={[lead.id]}
        currentId={lead.assigned_rep_id || 0}
        onConfirm={handleTransfer}
        onClose={() => setTransferOpen(false)}
        loading={transferLoading}
        showLeadCount={false}
      />

      {/* Result Modal */}
      <ResultModal
        open={resultOpen}
        success={resultSuccess}
        message={resultMessage}
        onClose={() => setResultOpen(false)}
      />
    </div>
  );
}