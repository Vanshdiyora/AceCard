import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";

import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { fetchLeadById } from "../slice";

import LeadOverviewTab from "../components/details/LeadOverviewTab";
import LeadTimelineTab from "../components/details/LeadTimeLineTab";
import LeadNotesTab from "../components/details/LeadNotesTab";
import LeadFollowupsTab from "../components/details/LeadFollowupsTab";
import LeadProductsTab from "../components/details/LeadProductsTab";
import BrandLoader from "../../../common/ui/BrandLoader";

const TABS = ["overview", "timeline", "notes", "followups", "products"] as const;

export default function LeadDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [activeTab, setActiveTab] =
    useState<typeof TABS[number]>("overview");

  const { leads, loading } = useAppSelector((s) => s.leads);
  const lead = leads.find((l) => l.id === Number(id));

  useEffect(() => {
    if (id) {
      dispatch(fetchLeadById(Number(id)));
    }
  }, [id, dispatch]);

  /* ---------- Loading ---------- */
  if (loading && !lead) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <BrandLoader message="Loading lead..." />
      </div>
    );
  }

  /* ---------- Not Found ---------- */
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

  // ✅ TypeScript now knows lead exists
  if (!lead) return null;

  return (
    <div className="mx-auto p-6 space-y-6">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-xs text-gray-400 hover:text-gray-700 transition"
      >
        <ArrowLeft size={14} />
        Back to Leads
      </button>

      {/* Header */}
      <div className="bg-white border border-gray-100 rounded-3xl px-6 py-5 shadow-sm flex justify-between items-center">
        <div className="flex flex-col">
          <span className="text-xs uppercase tracking-wide text-gray-400">
            Lead
          </span>
          <h2 className="text-xl font-semibold text-gray-900">
            {lead.lead_name}
          </h2>
          <span className="text-sm text-gray-500">{lead.company}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b text-sm">
        {TABS.map((t) => {
          const active = activeTab === t;
          return (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`pb-3 capitalize transition ${
                active
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
        {activeTab === "overview" && <LeadOverviewTab lead={lead} />}
        {activeTab === "timeline" && <LeadTimelineTab leadId={lead.id} />}
        {activeTab === "notes" && <LeadNotesTab leadId={lead.id} />}
        {activeTab === "followups" && <LeadFollowupsTab />}
        {activeTab === "products" && <LeadProductsTab lead={lead} />}
      </div>
    </div>
  );
}
