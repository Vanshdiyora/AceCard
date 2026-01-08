import type { Lead } from "../../types";
import { Mail, Phone, MapPin } from "lucide-react";

interface Props {
  lead: Lead;
}

export default function LeadOverviewTab({ lead }: Props) {
  return (
    <div className="space-y-4">
      {/* Top info cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <InfoCard icon={<Mail size={18} />} label="Email" value={lead.email || "Not provided"} />
        <InfoCard icon={<Phone size={18} />} label="Phone" value={lead.phone || "Not provided"} />
        <InfoCard icon={<MapPin size={18} />} label="Location" value="Not provided" />
      </div>

      {/* Details section */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12 text-sm">
          <Info label="Company" value={lead.company} />
          <Info label="Stage" value={lead.stage} />
          <Info label="Source" value={lead.source} />
          <Info label="Deal Amount" value={`$${lead.deal_amount}`} />
          <Info
            label="Created"
            value={new Date(lead.created_at).toLocaleDateString()}
          />
          <Info
            label="Last Interaction"
            value={new Date(lead.last_interaction_at).toLocaleString()}
          />
        </div>
      </div>
    </div>
  );
}

const InfoCard = ({ icon, label, value }: any) => (
  <div className="bg-white border border-gray-100 rounded-2xl px-5 py-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
    <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
      {icon}
    </div>
    <div className="flex flex-col">
      <span className="text-xs text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-900 truncate max-w-[200px]">
        {value}
      </span>
    </div>
  </div>
);

const Info = ({ label, value }: any) => (
  <div className="flex flex-col gap-1">
    <span className="text-xs text-gray-500 uppercase tracking-wide">
      {label}
    </span>
    <span className="text-sm font-medium text-gray-900">
      {value || "—"}
    </span>
  </div>
);
