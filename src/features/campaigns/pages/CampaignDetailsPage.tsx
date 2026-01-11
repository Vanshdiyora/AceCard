import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import { Copy } from "lucide-react";
import { duplicateCampaign } from "../slice";

import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { fetchCampaignById, archiveCampaign } from "../slice";
import { fetchTeam } from "../../teams/slice";
import { fetchProducts } from "../../products/slice";
import EditCampaignModal from "../components/EditCampaignModal";
import CampaignOverviewTab from "../components/details/CampaignOverviewTab";
import CampaignSalespersonsTab from "../components/details/CampaignSalespersonsTab";
import CampaignProductsTab from "../components/details/CampaignProductsTab";
import ArchiveCampaignModal from "../components/ArchiveCampaignModal";
import { selectEnrichedCampaignById } from "../selectors";
import type { EnrichedCampaign } from "../types";
import BrandLoader from "../../../common/ui/BrandLoader";

const TABS = ["overview", "salespersons", "products"] as const;

export default function CampaignDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [openEdit, setOpenEdit] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [duplicating, setDuplicating] = useState(false);

  const [activeTab, setActiveTab] = useState<typeof TABS[number]>("overview");

  const campaign = useAppSelector(
    selectEnrichedCampaignById(Number(id))
  ) as EnrichedCampaign | null;

  const loading = useAppSelector((s) => s.campaigns.loading);

  useEffect(() => {
    if (id) {
      dispatch(fetchCampaignById(Number(id)));
    }
    dispatch(fetchTeam());
    dispatch(fetchProducts({ page: 1, page_size: 10 }));
  }, [id, dispatch]);

  if (loading && !campaign) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <BrandLoader message="Loading campaign..." />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="flex flex-col h-full">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center mt-6 gap-2 text-sm text-gray-500 hover:text-black"
        >
          <ArrowLeft size={16} />
          Back to Campaigns
        </button>

        <div className="flex flex-1 items-center justify-center text-red-500">
          Campaign not found
        </div>
      </div>
    );
  }


  const isReadOnly =
    campaign.status === "archived" ||
    campaign.status === "expired" ||
    campaign.status === "completed";

  const handleArchive = async () => {
    try {
      setArchiving(true);
      await dispatch(archiveCampaign(campaign.id)).unwrap();
      navigate("/admin/campaigns");
    } finally {
      setArchiving(false);
      setArchiveOpen(false);
    }
  };

  return (
    <div className="min-h-screen p-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-black"
      >
        <ArrowLeft size={16} />
        Back to Campaigns
      </button>

      <div className="bg-white rounded-2xl p-6 shadow-sm flex justify-between items-center mt-6">
        <div>
          <h2 className="text-2xl font-semibold">{campaign.name}</h2>
          <p className="text-gray-500 mt-1">
            {campaign.description || "No description provided"}
          </p>
        </div>

        <div className="flex gap-3">
          <button
            disabled={isReadOnly}
            onClick={() => setOpenEdit(true)}
            className={`px-4 py-2 rounded-xl border flex items-center gap-2 text-sm ${isReadOnly ? "opacity-50 cursor-not-allowed" : "hover:bg-purple-50"
              }`}
          >
            <Edit size={16} /> Edit
          </button>

          {campaign.status === "archived" ? (
            <button
              disabled={duplicating}
              onClick={async () => {
                try {
                  setDuplicating(true);
                  const newCampaign = await dispatch(duplicateCampaign(campaign)).unwrap();
                  navigate(`/admin/campaigns/${newCampaign.id}`);
                } finally {
                  setDuplicating(false);
                }
              }}
              className={`px-4 py-2 rounded-xl border flex items-center gap-2 text-sm ${duplicating ? "opacity-50 cursor-not-allowed" : "hover:bg-green-50"
                }`}
            >
              <Copy size={16} />
              {duplicating ? "Duplicating..." : "Duplicate"}
            </button>
          ) : (
            <button
              onClick={() => setArchiveOpen(true)}
              disabled={isReadOnly}
              className={`px-4 py-2 rounded-xl bg-red-50 text-red-600 flex items-center gap-2 text-sm ${isReadOnly ? "opacity-50 cursor-not-allowed" : "hover:bg-red-100"
                }`}
            >
              <Trash2 size={16} /> Archive
            </button>
          )}


        </div>
      </div>

      <div className="flex gap-8 border-b border-gray-200 my-6">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`relative pb-3 text-sm capitalize transition ${activeTab === t
              ? "text-purple-600 font-medium"
              : "text-gray-400 hover:text-gray-600"
              }`}
          >
            {t}
            {activeTab === t && (
              <span className="absolute left-0 -bottom-[1px] h-[2px] w-full bg-purple-600 rounded-full" />
            )}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <CampaignOverviewTab campaign={campaign} />
        </div>
      )}

      {activeTab === "salespersons" && (
        <CampaignSalespersonsTab
          campaignId={campaign.id}
          assignedReps={campaign.assigned_reps ?? []}
        />
      )}

      {activeTab === "products" && (
        <CampaignProductsTab assignedProducts={campaign.products ?? []} />
      )}

      <EditCampaignModal
        open={openEdit}
        onClose={() => setOpenEdit(false)}
        campaign={campaign}
      />

      <ArchiveCampaignModal
        open={archiveOpen}
        campaignName={campaign.name}
        loading={archiving}
        onClose={() => setArchiveOpen(false)}
        onConfirm={handleArchive}
      />
      {duplicating && (
        <div className="fixed inset-0 bg-white/70 backdrop-blur-sm z-50 flex items-center justify-center">
          <BrandLoader message="Duplicating campaign..." />
        </div>
      )}

    </div>
  );
}
