import {
  UserCircle2,
  Share2,
  ListChecks,
  // Megaphone,
  // Bell,
  Globe,
  // Building2,
  HelpCircle
} from "lucide-react";

const items = [
  { id: "account", label: "Account Settings", icon: UserCircle2 },
  { id: "crm", label: "CRM Integration", icon: Share2 },
  { id: "lead", label: "Lead Configuration", icon: ListChecks },
  // { id: "campaign", label: "Campaign Settings", icon: Megaphone },
  // { id: "notifications", label: "Notification Preferences", icon: Bell },
  { id: "questions", label: "Suggested Questions", icon: HelpCircle },
  { id: "profile", label: "Public Profile Settings", icon: Globe },

  // { id: "vendor", label: "Vendor Information", icon: Building2 },
];

export default function SettingsSidebar({ active, onChange }: any) {
  return (
    <div className="w-64 bg-white shadow rounded-xl py-4 border">
      {items.map((item) => {
        const Icon = item.icon;
        const selected = active === item.id;

        return (
          <button
            key={item.id}
            onClick={() => onChange(item.id)}
            className={`flex items-center gap-3 w-full px-5 py-3 text-sm rounded-lg
              ${selected ? "bg-purple-50 text-purple-700" : "hover:bg-gray-100"}
            `}
          >
            <Icon className={`w-4 h-4`} />
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
