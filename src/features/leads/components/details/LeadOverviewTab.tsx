import type { Lead } from "../../types";
import { Mail, Phone, MapPin } from "lucide-react";

interface Props {
  lead: Lead;
}

export default function LeadOverviewTab({ lead }: Props) {
  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <InfoCard icon={<Mail size={18} />} label="Email" value={lead.email} />
        <InfoCard icon={<Phone size={18} />} label="Phone" value={lead.phone} />
        <InfoCard icon={<MapPin size={18} />} label="Location" value="Not provided" />
      </div>

      <div className="bg-white border rounded-xl p-5 grid grid-cols-2 gap-6 text-sm">
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
  );
}

const InfoCard = ({ icon, label, value }: any) => (
  <div className="bg-white border rounded-xl p-4 flex gap-3 shadow-sm">
    <div className="text-purple-600">{icon}</div>
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="font-medium text-sm">{value}</p>
    </div>
  </div>
);

const Info = ({ label, value }: any) => (
  <div>
    <p className="text-gray-500">{label}</p>
    <p className="font-medium">{value}</p>
  </div>
);
