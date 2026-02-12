import { formatRupees } from "../../../../common/utils/ruppeeFormater";
import type { Lead } from "../../types";
import { Mail, Phone, MapPin } from "lucide-react";

interface Props {
  lead: Lead & {
    custom_fields?: Record<string, any>;
  };
}

export default function LeadOverviewTab({ lead }: Props) {
  /* -----------------------------
     BASE FIELDS (excluding arrays)
  ----------------------------- */

  const baseFields = [
    { label: "Company", value: lead.company },
    { label: "Stage", value: lead.stage },
    { label: "Source", value: lead.source },
    {
      label: "Deal Amount",
      value:
        lead.deal_amount !== null && lead.deal_amount !== undefined
          ? formatRupees(lead.deal_amount)
          : "—",
    },
    { label: "Vendor", value: (lead as any).vendor_name },
    { label: "Assigned Rep", value: lead.assigned_rep_name },
    { label: "Rating", value: (lead as any).rating },
    { label: "Marketing Source", value: (lead as any).marketing_source },
    { label: "Job Title", value: (lead as any).job_title },
    { label: "Business Phone", value: (lead as any).business_phone },
    {
      label: "Created",
      value: new Date(lead.created_at).toLocaleDateString(),
    },
    {
      label: "Updated",
      value: new Date(lead.updated_at).toLocaleDateString(),
    },
  ];

  /* -----------------------------
     CUSTOM FIELDS
  ----------------------------- */

  const customFields = lead.custom_fields
    ? Object.entries(lead.custom_fields).map(([key, value]) => ({
      label: formatLabel(key),
      value: value,
    }))
    : [];

  const allFields = [...baseFields, ...customFields];

  return (
    <div className="space-y-6">

      {/* Top Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <InfoCard icon={<Mail size={18} />} label="Email" value={lead.email || "Not provided"} />
        <InfoCard icon={<Phone size={18} />} label="Phone" value={lead.phone || "Not provided"} />
        <InfoCard
          icon={<MapPin size={18} />}
          label="Location"
          value={
            lead.latitude && lead.longitude ? (
              <a
                href={`https://www.google.com/maps?q=${lead.latitude},${lead.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-600 hover:underline"
              >
                View on Map
              </a>
            ) : (
              "Not provided"
            )
          }
        />

      </div>

      {/* Overview Details */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
          {allFields.map((item, index) => (
            <Info
              key={index}
              label={item.label}
              value={item.value}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* -----------------------------
   Components
----------------------------- */
const InfoCard = ({ icon, label, value }: any) => (
  <div className="bg-white border border-gray-100 rounded-2xl px-5 py-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
    <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
      {icon}
    </div>
    <div className="flex flex-col flex-1">
      <span className="text-xs text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-900 break-all">
        {value || "—"}
      </span>
    </div>
  </div>
);


const Info = ({ label, value }: any) => (
  <div className="flex flex-col gap-1">
    <span className="text-xs text-gray-500 uppercase tracking-wide">
      {label}
    </span>
    <span className="text-sm font-medium text-gray-900 break-words">
      {value || "—"}
    </span>
  </div>
);

/* -----------------------------
   Helper
----------------------------- */

function formatLabel(key: string) {
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
