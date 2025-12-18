import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";

import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { fetchCampaignById, archiveCampaign } from "../slice";

import CampaignOverviewTab from "../components/details/CampaignOverviewTab";
import CampaignSalespersonsTab from "../components/details/CampaignSalespersonsTab";

const TABS = ["overview", "salespersons", "products", "activity"] as const;

export default function CampaignDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [activeTab, setActiveTab] =
    useState<typeof TABS[number]>("overview");

  const { items, loading } = useAppSelector((s) => s.campaigns);

  const campaign = items.find((c) => c.id === Number(id));

  // ✅ FETCH ON LOAD / REFRESH
  useEffect(() => {
    if (id) {
      dispatch(fetchCampaignById(Number(id)));
    }
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
            className={`btn-outline ${
              isReadOnly ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <Edit size={16} /> Edit
          </button>

          <button
            onClick={archive}
            disabled={isReadOnly}
            className={`btn-danger ${
              isReadOnly ? "opacity-50 cursor-not-allowed" : ""
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

      {/* Content */}
      {activeTab === "overview" && (
        <CampaignOverviewTab campaign={campaign} />
      )}

    {activeTab === "salespersons" && (
        <CampaignSalespersonsTab campaignId={campaign.id} />
    )}


      {activeTab === "products" && (
        <div className="text-sm text-gray-500 py-10 text-center">
          This section will be available soon.
        </div>
      )}

      {activeTab === "activity" && (
        <div className="text-sm text-gray-500 py-10 text-center">
          This section will be available soon.
        </div>
      )}
    </div>
  );
}
