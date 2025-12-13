import type { Campaign } from "../types";
function getStatusStyle(status: string) {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-700";
    case "planned":
      return "bg-blue-100 text-blue-700";
    case "draft":
      return "bg-gray-200 text-gray-700";
    case "paused":
      return "bg-yellow-100 text-yellow-700";
    case "completed":
      return "bg-purple-100 text-purple-700";
    case "archived":
      return "bg-gray-300 text-gray-800";
    case "expired":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-600";
  }
}

export default function CampaignCard({ data }: { data: Campaign }) {
  return (
    <div className="bg-white p-6 rounded-xl border shadow-sm hover:shadow-md transition">
      <div className="flex justify-between">
        <h2 className="text-lg font-semibold">{data.name}</h2>

        {/* Status badge */}
        <span
          className={`px-3 py-1 text-xs capitalize rounded-full ${getStatusStyle(
            data.status
          )}`}
        >
          {data.status}
        </span>
      </div>

      <p className="text-gray-500 text-sm mt-1">{data.description}</p>

      <div className="grid grid-cols-3 mt-4 text-sm">
        <div>
          <p className="text-gray-500">Leads</p>
          <p className="font-semibold">{data.leads_generated}</p>
        </div>

        <div>
          <p className="text-gray-500">Pipeline</p>
          <p className="font-semibold">${data.pipeline_value}K</p>
        </div>

        <div>
          <p className="text-gray-500">Conversion</p>
          <p className="text-purple-600 font-semibold">
            {data.conversion_rate}%
          </p>
        </div>
      </div>
    </div>
  );
}
