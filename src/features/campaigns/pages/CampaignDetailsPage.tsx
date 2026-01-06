import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";

import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { fetchCampaignById, archiveCampaign } from "../slice";
import { fetchTeam } from "../../teams/slice";
import { fetchProducts } from "../../products/slice";
import EditCampaignModal from "../components/EditCampaignModal";
import CampaignOverviewTab from "../components/details/CampaignOverviewTab";
import CampaignSalespersonsTab from "../components/details/CampaignSalespersonsTab";
import { selectEnrichedCampaignById } from "../selectors";
import type { EnrichedCampaign } from "../types";


const TABS = ["overview", "salespersons"] as const;

export default function CampaignDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [openEdit, setOpenEdit] = useState(false);

  const [activeTab, setActiveTab] =
    useState<typeof TABS[number]>("overview");


  const campaign = useAppSelector(
    selectEnrichedCampaignById(Number(id))
  ) as EnrichedCampaign | null;
  const loading = useAppSelector((s) => s.campaigns.loading);


  // ✅ FETCH ON LOAD / REFRESH

  useEffect(() => {
    if (id) {
      dispatch(fetchCampaignById(Number(id)));
    }

    dispatch(fetchTeam());
    dispatch(fetchProducts());
  }, [id, dispatch]);

  // ✅ LOADING STATE
  if (loading && !campaign) {
    return (
      <div className="p-6 text-gray-500">
        Loading campaign...
      </div>
    );
  }

  // ✅ NOT FOUND STATE
  if (!campaign) {
    return (
      <div className="p-6 text-red-500">
        Campaign not found
      </div>
    );
  }

  const isReadOnly =
    campaign.status === "archived" ||
    campaign.status === "expired" ||
    campaign.status === "completed";

  const archive = async () => {
    if (confirm("Archive this campaign?")) {
      await dispatch(archiveCampaign(campaign.id));
      navigate("/admin/campaigns");
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-black"
      >
        <ArrowLeft size={16} />
        Back to Campaigns
      </button>

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold">
            {campaign.name}
          </h2>
          <p className="text-gray-500">
            {campaign.description || "-"}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            disabled={isReadOnly}
            onClick={() => setOpenEdit(true)}
            className={`btn-outline ${isReadOnly ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <Edit size={16} /> Edit
          </button>


          <button
            onClick={archive}
            disabled={isReadOnly}
            className={`btn-danger ${isReadOnly ? "opacity-50 cursor-not-allowed" : ""
              }`}
          >
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
            className={`pb-2 capitalize ${activeTab === t
                ? "border-b-2 border-purple-600 text-purple-600 font-medium"
                : "text-gray-500"
              }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === "overview" && (
        <CampaignOverviewTab campaign={campaign} />
      )}

      {activeTab === "salespersons" && campaign && (
        <CampaignSalespersonsTab
          campaignId={campaign.id}
          assignedReps={campaign.assigned_reps ?? []}
        />
      )}

      <EditCampaignModal
        open={openEdit}
        onClose={() => setOpenEdit(false)}
        campaign={campaign}
      />

    </div>
  );
}
