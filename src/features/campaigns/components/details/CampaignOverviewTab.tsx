import { formatRupees } from "../../../../common/utils/ruppeeFormater";
import type { EnrichedCampaign, Campaign } from "../../types";

type Props = {
  campaign: EnrichedCampaign;
};

export default function CampaignOverviewTab({ campaign }: Props) {
  return (
    <div className="relative bg-white rounded-2xl">

      {/* Status (top-right) */}
      <div className="absolute top-0 right-0">
        <StatusPill status={campaign.status} />
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-6">
        <Info label="Campaign Name" value={campaign.name} />
        <Info label="Owner" value={campaign.manager_name ?? "—"} />
        <Info label="Budget / Target" value={`${formatRupees(campaign.budget)}`} />
        <Info label="Start Date" value={formatDate(campaign.start_date)} />
        <Info label="End Date" value={formatDate(campaign.end_date)} />
        <Info label="Campaign ID" value={campaign.id} />
      </div>

      {/* Divider */}
      <div className="border-t pt-6 mt-6">
        <div className="min-w-0">
          <p className="text-sm text-gray-600 leading-relaxed break-words whitespace-pre-wrap">
            {campaign.description || "No description provided."}
          </p>
        </div>
      </div>

    </div>
  );
}

function Info({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="space-y-1 min-w-0">
      <div className="text-[11px] uppercase tracking-wide text-gray-400">
        {label}
      </div>
      <div className="text-sm font-medium text-gray-900 break-words whitespace-normal">
        {value || "—"}
      </div>
    </div>
  );
}


function StatusPill({ status }: { status: Campaign["status"] }) {
  const map: Record<string, string> = {
    planned: "bg-blue-50 text-blue-700 ring-blue-200",
    active: "bg-green-50 text-green-700 ring-green-200",
    paused: "bg-yellow-50 text-yellow-700 ring-yellow-200",
    archived: "bg-gray-100 text-gray-700 ring-gray-300",
    completed: "bg-purple-50 text-purple-700 ring-purple-200",
  };

  return (
    <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ring-1 ${map[status]}`}>
      <span className="h-2 w-2 rounded-full bg-current opacity-70" />
      {status}
    </span>
  );
}

function formatDate(date?: string | null) {
  return date ? date.split("T")[0] : "—";
}
