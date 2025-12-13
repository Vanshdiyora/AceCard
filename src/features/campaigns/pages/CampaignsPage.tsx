import { useEffect, useState } from "react";
import PageHeader from "../../../common/components/layout/PageHeader";
import PageFilters from "../../../common/components/layout/PageFilter";
import { useAppSelector, useAppDispatch } from "../../../app/hooks";
import CampaignCard from "../components/CampaignCard";
import { fetchCampaigns } from "../slice";
import CreateCampaignModal from "../components/CreateCampaignModal";
import StatsGrid from "../../../common/components/cards/StatsGrid";

export default function CampaignsPage() {
  const dispatch = useAppDispatch();
  const [openCreate, setOpenCreate] = useState(false);
  const { items: campaigns, loading } = useAppSelector(
    (state) => state.campaigns
  );

  useEffect(() => {
    dispatch(fetchCampaigns());
  }, [dispatch]);

  // ----- Compute Stats -----
  const totalLeads = campaigns.reduce(
    (sum, c) => sum + c.leads_generated,
    0
  );

  const totalPipeline = campaigns.reduce(
    (sum, c) => sum + c.pipeline_value,
    0
  );

  const avgConversion =
    campaigns.length > 0
      ? (
          campaigns.reduce(
            (sum, c) => sum + c.conversion_rate,
            0
          ) / campaigns.length
        ).toFixed(2)
      : 0;

  const totalBudget = campaigns.reduce(
    (sum, c) => sum + c.budget,
    0
  );

  const statItems = [
    { title: "Total Leads", value: totalLeads },
    { title: "Total Pipeline", value: `$${totalPipeline}K` },
    { title: "Avg. Conversion", value: `${avgConversion}%` },
    { title: "Total Budget", value: `$${totalBudget}K` },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <PageHeader
        title="Campaigns"
        description="Manage and track your marketing campaigns"
        addButtonLabel="Create Campaign"
        onAdd={() => setOpenCreate(true)}
      />

      <CreateCampaignModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
      />

      {/* Stats */}
      <StatsGrid items={statItems} />

      {/* Filters */}
      <PageFilters
        searchPlaceholder="Search campaigns..."
        onSearch={(v) => console.log("Search:", v)}
        onFilter={() => console.log("Filter")}
        onExport={() => console.log("Export")}
      />

      {/* Loader */}
      {loading && (
        <p className="text-center text-gray-500">Loading campaigns...</p>
      )}

      {/* Campaign list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {!loading &&
          campaigns.map((c) => <CampaignCard key={c.id} data={c} />)}
      </div>
    </div>
  );
}
