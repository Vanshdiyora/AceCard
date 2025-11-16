interface Props {
  title: string;
  status: "active" | "paused";
  leads: number;
  pipeline: number;
  conversion: number;
  owner: string;
}

export default function CampaignCard({
  title,
  status,
  leads,
  pipeline,
  conversion,
  owner,
}: Props) {
  return (
    <div className="bg-white border rounded-xl p-5 shadow-sm min-w-[280px]">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">{title}</h3>
        <span
          className={`text-xs px-2 py-1 rounded-full ${
            status === "active"
              ? "bg-black text-white"
              : "bg-gray-200 text-gray-600"
          }`}
        >
          {status}
        </span>
      </div>

      <div className="text-sm space-y-1 mb-3">
        <p>
          Leads <span className="float-right font-medium">{leads}</span>
        </p>
        <p>
          Pipeline <span className="float-right font-medium">{pipeline}</span>
        </p>
        <p>
          Conversion <span className="float-right font-medium">{conversion}</span>
        </p>
      </div>

      <div className="text-xs text-gray-500 border-t pt-2">
        Owner: {owner}
      </div>
    </div>
  );
}
