import type { Campaign } from "../../types";

type Props = {
  campaign: Campaign & {
    owner_name?: string;
    salespersons?: { id: number; name: string }[];
    products?: { id: number; name: string }[];
    start_date?: string;
    end_date?: string | null;
  };
};

export default function CampaignOverviewTab({ campaign }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">

      {/* Basic */}
      <Field label="Campaign Name" value={campaign.name} />
      <StatusField status={campaign.status} />

      <Field label="Budget / Target" value={`$${campaign.budget}K`} />
      <Field label="Owner (Manager)" value={campaign.owner_name ?? "—"} />

      <Field
        label="Start Date"
        value={campaign.start_date?.split("T")[0] ?? "—"}
      />

      <Field
        label="End Date"
        value={campaign.end_date?.split("T")[0] ?? "—"}
      />

      {/* Description full width */}
      <div className="md:col-span-2">
        <Field label="Description" value={campaign.description} />
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
      <div className="font-medium break-words">{value || "—"}</div>
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
