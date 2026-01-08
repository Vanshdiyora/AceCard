import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";

import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { updateLead, archiveLead, fetchLeadById } from "../slice";

import EditLeadModal from "../components/EditLeadModal";
import LeadOverviewTab from "../components/details/LeadOverviewTab";
import LeadTimelineTab from "../components/details/LeadTimeLineTab";
import LeadNotesTab from "../components/details/LeadNotesTab";
import LeadFollowupsTab from "../components/details/LeadFollowupsTab";
import LeadProductsTab from "../components/details/LeadProductsTab";

const TABS = ["overview", "timeline", "notes", "followups", "products"] as const;

export default function LeadDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [activeTab, setActiveTab] =
    useState<typeof TABS[number]>("overview");
  const [editOpen, setEditOpen] = useState(false);

  const { leads, loading } = useAppSelector((s) => s.leads);
  const lead = leads.find((l) => l.id === Number(id));

  useEffect(() => {
    if (id) {
      dispatch(fetchLeadById(Number(id)));
    }
  }, [id, dispatch]);

  if (loading && !lead) {
    return <div className="p-8 text-sm text-gray-500">Loading lead…</div>;
  }

  if (!loading && !lead) {
    return <div className="p-8 text-sm text-red-500">Lead not found</div>;
  }

  if (!lead) return null;

  const archive = async () => {
    if (confirm("Archive this lead?")) {
      await dispatch(archiveLead(lead.id));
      navigate("/admin/leads");
    }
  };

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

        <div className="flex gap-2">
          <button
            onClick={() => setEditOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-xl border border-gray-200 hover:bg-gray-50 transition"
          >
            <Edit size={14} />
            Edit
          </button>
          <button
            onClick={archive}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-xl border border-red-200 text-red-600 hover:bg-red-50 transition"
          >
            <Trash2 size={14} />
            Archive
          </button>
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
        {activeTab === "timeline" && <LeadTimelineTab lead={lead} />}
        {activeTab === "notes" && <LeadNotesTab leadId={lead.id} />}
        {activeTab === "followups" && <LeadFollowupsTab />}
        {activeTab === "products" && <LeadProductsTab lead={lead} />}
      </div>

      {/* Edit Modal */}
      <EditLeadModal
        open={editOpen}
        lead={lead}
        onClose={() => setEditOpen(false)}
        onSubmit={(data) => {
          dispatch(updateLead({ id: lead.id, data }));
          setEditOpen(false);
        }}
      />
    </div>
  );
}
