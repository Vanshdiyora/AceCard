// pages/LeadDetailsPage.tsx
import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";

import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { updateLead, archiveLead } from "../slice";

import EditLeadModal from "../components/EditLeadModal";
import LeadOverviewTab from "../components/details/LeadOverviewTab";
import LeadTimelineTab from "../components/details/LeadTimeLineTab";
import LeadNotesTab from "../components/details/LeadNotesTab";
import LeadFollowupsTab from "../components/details/LeadFollowupsTab";
import LeadProductsTab from "../components/details/LeadProductsTab";

const TABS = [
  "overview",
  "timeline",
  "notes",
  "followups",
  "products",
] as const;

export default function LeadDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [activeTab, setActiveTab] = useState<typeof TABS[number]>("overview");
  const [editOpen, setEditOpen] = useState(false);

  const { leads } = useAppSelector((s) => s.leads);
  const lead = leads.find((l) => l.id === Number(id));

  if (!lead) return <div className="p-6">Lead not found</div>;

  const archive = async () => {
    if (confirm("Archive this lead?")) {
      await dispatch(archiveLead(lead.id));
      navigate("/admin/leads");
    }
  };

  return (
    <div className="p-6 space-y-6">
        {/* Back Button */}
<button
  onClick={() => navigate(-1)}
  className="flex items-center gap-2 text-sm text-gray-500 hover:text-black"
>
  <ArrowLeft size={16} />
  Back to Leads
</button>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold">{lead.lead_name}</h2>
          <p className="text-gray-500">{lead.company}</p>
        </div>

        <div className="flex gap-2">
          <button onClick={() => setEditOpen(true)} className="btn-outline">
            <Edit size={16} /> Edit
          </button>
          <button onClick={archive} className="btn-danger">
            <Trash2 size={16} /> Archive
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b text-sm">
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
            {t.replace("_", " ")}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && <LeadOverviewTab lead={lead} />}
      {activeTab === "timeline" && <LeadTimelineTab lead={lead} />}
      {activeTab === "notes" && <LeadNotesTab leadId={lead.id} />}
      {activeTab === "followups" && <LeadFollowupsTab />}
     {activeTab === "products" && <LeadProductsTab lead={lead} />}

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
