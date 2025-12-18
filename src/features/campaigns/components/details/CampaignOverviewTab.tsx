import type { Campaign } from "../../types";

type Props = {
  campaign: Campaign;
};

export default function CampaignOverviewTab({ campaign }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
      <Field label="Campaign Name" value={campaign.name} />

      <StatusField status={campaign.status} />

      <Field label="Budget" value={`$${campaign.budget}K`} />

      <Field
        label="Leads Generated"
        value={campaign.leads_generated}
      />

      <Field
        label="Conversion Rate"
        value={`${campaign.conversion_rate}%`}
      />

      <Field
        label="Pipeline Value"
        value={`$${campaign.pipeline_value}K`}
      />

      <div className="md:col-span-2">
        <Field
          label="Description"
          value={campaign.description}
        />
      </div>
    </div>
  );
}

/* ---------- Helpers ---------- */

function Field({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div>
      <div className="text-gray-500">{label}</div>
      <div className="font-medium">{value ?? "-"}</div>
    </div>
  );
}

function StatusField({
  status,
}: {
  status: Campaign["status"];
}) {
  const colorMap: Record<string, string> = {
    planned: "bg-blue-100 text-blue-700",
    draft: "bg-gray-100 text-gray-600",
    active: "bg-green-100 text-green-700",
    paused: "bg-yellow-100 text-yellow-700",
    archived: "bg-gray-200 text-gray-700",
    completed: "bg-purple-100 text-purple-700",
    expired: "bg-red-100 text-red-700",
  };

  return (
    <div>
      <div className="text-gray-500">Status</div>
      <span
        className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-medium ${
          colorMap[status]
        }`}
      >
        {status}
      </span>
    </div>
  );
}
