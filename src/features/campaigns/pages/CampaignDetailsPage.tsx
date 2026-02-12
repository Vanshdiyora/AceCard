import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowLeft, Edit, Trash2, Copy } from "lucide-react";

import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import {
  fetchCampaignById,
  archiveCampaign,
  duplicateCampaign,
} from "../slice";
import { BudgetProgressBar } from "../components/BudgetProgressBar";
import EditCampaignModal from "../components/EditCampaignModal";
import CampaignOverviewTab from "../components/details/CampaignOverviewTab";
import CampaignSalespersonsTab from "../components/details/CampaignSalespersonsTab";
import CampaignProductsTab from "../components/details/CampaignProductsTab";
import ConfirmationModal from "../../../common/ui/ConfirmationModal";
import { selectEnrichedCampaignById } from "../selectors";
import type { EnrichedCampaign } from "../types";
import BrandLoader from "../../../common/ui/BrandLoader";
import BlockingLoader from "../../../common/ui/BlockingLoader";
import ResultModal from "../../../common/ui/ResultModal";
import DetailPageHeader from "../../../common/components/layout/DetailPageHeader";

const TABS = ["overview", "salespersons", "products"] as const;

export default function CampaignDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [openEdit, setOpenEdit] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState<"archive" | "duplicate" | null>(null);

  const [processing, setProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<typeof TABS[number]>("overview");

  const [resultOpen, setResultOpen] = useState(false);
  const [resultSuccess, setResultSuccess] = useState(true);
  const [resultMessage, setResultMessage] = useState("");

  const showResult = (success: boolean, message: string) => {
    setResultSuccess(success);
    setResultMessage(message);
    setResultOpen(true);
  };

  const campaign = useAppSelector(
    selectEnrichedCampaignById(Number(id))
  ) as EnrichedCampaign | null;
  const loading = useAppSelector((s) => s.campaigns.loading);

  useEffect(() => {
    if (id) dispatch(fetchCampaignById(Number(id)));
    // dispatch(fetchTeam());
    // dispatch(fetchProducts({ page: 1, page_size: 10 }));
  }, [id, dispatch]);

  useEffect(() => {
    const shouldLock = openEdit || confirmOpen || resultOpen;

    if (!shouldLock) return;

    const scrollY = window.scrollY;

    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";

    return () => {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      window.scrollTo(0, scrollY);
    };
  }, [openEdit, confirmOpen, resultOpen]);

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
    campaign.status === "archived";
  // campaign.status === "completed";
  const totalDealAmount =
    campaign.assigned_reps?.reduce(
      (sum, rep) => sum + (rep.total_deal_amount || 0),
      0
    ) ?? 0;


  const handleArchive = async () => {
    try {
      setProcessing(true);
      await dispatch(archiveCampaign(campaign.id)).unwrap();
      showResult(true, "Campaign archived successfully.");
    } catch {
      showResult(false, "Failed to archive campaign.");
    } finally {
      setProcessing(false);
      setConfirmOpen(null);
    }
  };

  const handleDuplicate = async () => {
    try {
      setProcessing(true);
      const newCampaign = await dispatch(duplicateCampaign(campaign)).unwrap();
      showResult(true, "Campaign duplicated successfully.");
      navigate(`/admin/campaigns/${newCampaign.id}`);
    } catch {
      showResult(false, "Failed to duplicate campaign.");
    } finally {
      setProcessing(false);
      setConfirmOpen(null);
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
      <div className="mt-6" />
      <DetailPageHeader
        title={campaign.name}
        subtitle={campaign.description || "No description provided"}
        status={{
  label: campaign.status,
}}
        actions={
          <div className="flex items-center gap-6">

            {/* ✅ Budget Progress */}
            <BudgetProgressBar
              used={totalDealAmount}
              total={campaign.budget ?? 0}
            />

            {/* Existing Buttons */}
            <div className="flex gap-3">
              <button
                disabled={isReadOnly || processing}
                onClick={() => setOpenEdit(true)}
                className={`px-4 py-2 rounded-xl border flex items-center gap-2 text-sm ${isReadOnly ? "opacity-50 cursor-not-allowed" : "hover:bg-purple-50"
                  }`}
              >
                <Edit size={16} /> Edit
              </button>

              {campaign.status === "archived" ? (
                <button
                  disabled={processing}
                  onClick={() => setConfirmOpen("duplicate")}
                  className={`px-4 py-2 rounded-xl border flex items-center gap-2 text-sm ${processing ? "opacity-50 cursor-not-allowed" : "hover:bg-green-50"
                    }`}
                >
                  <Copy size={16} /> Duplicate
                </button>
              ) : (
                <button
                  disabled={processing || isReadOnly}
                  onClick={() => setConfirmOpen("archive")}
                  className={`px-4 py-2 rounded-xl bg-red-50 text-red-600 flex items-center gap-2 text-sm ${isReadOnly ? "opacity-50 cursor-not-allowed" : "hover:bg-red-100"
                    }`}
                >
                  <Trash2 size={16} /> Archive
                </button>
              )}
            </div>
          </div>
        }
      />

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

      <EditCampaignModal open={openEdit} onClose={() => setOpenEdit(false)} campaign={campaign} />

      <ConfirmationModal
        open={confirmOpen === "archive"}
        title="Archive Campaign"
        message={`Are you sure you want to archive "${campaign.name}"?`}
        confirmLabel="Archive"
        confirmVariant="danger"
        loading={processing}
        onClose={() => setConfirmOpen(null)}
        onConfirm={handleArchive}
      />

      <ConfirmationModal
        open={confirmOpen === "duplicate"}
        title="Duplicate Campaign"
        message={`Create a copy of "${campaign.name}"?`}
        confirmLabel="Duplicate"
        confirmVariant="primary"
        loading={processing}
        onClose={() => setConfirmOpen(null)}
        onConfirm={handleDuplicate}
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
