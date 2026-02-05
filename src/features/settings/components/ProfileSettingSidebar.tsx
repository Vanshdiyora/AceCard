import {
  UserCircle2,
  Globe,
  Share2,
  ListChecks,
  HelpCircle
} from "lucide-react";

const profileItems = [
  { id: "account", label: "Account Settings", icon: UserCircle2 },
  { id: "crm", label: "CRM Integration", icon: Share2 },
  { id: "lead", label: "Lead Configuration", icon: ListChecks },
  { id: "questions", label: "Suggested Questions", icon: HelpCircle },
  { id: "profile", label: "Public Profile Settings", icon: Globe },
];


type Props = {
  active: string;
  onChange: (tab: string) => void;
};

export default function ProfileSettingsSidebar({
  active,
  onChange,
}: Props) {

  return (
    <div className="fixed top-0 left-[260px] h-screen z-40 hidden lg:block">
      {/* Hover strip */}
      <div className="group h-full w-[10px] hover:w-[220px] transition-all duration-300 ease-out">
        <div className="h-full w-full bg-gradient-to-b from-purple-600 to-purple-700 rounded-r-2xl shadow-xl overflow-hidden">
          
          {/* Expanded panel */}
          <div className="opacity-0 group-hover:opacity-100 0 h-full px-4 py-6 text-white">

            {/* Back
            <button
              onClick={() => navigate("/settings")}
              className="flex items-center gap-2 text-sm text-purple-100 hover:text-white mb-6"
            >
              <ArrowLeft size={16} />
              Back to Settings
            </button> */}

            {/* Tabs */}
            <nav className="flex flex-col gap-2 pt-8">
              {profileItems.map((item) => {
                const Icon = item.icon;
                const selected = active === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => onChange(item.id)}
                    className={`
                      flex items-center gap-3 px-3 py-2 rounded-lg text-left
                      transition-colors
                      ${
                        selected
                          ? "bg-white text-purple-700 font-medium"
                          : "text-purple-100 hover:bg-purple-500/30"
                      }
                    `}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="text-sm">{item.label}</span>
                  </button>
                );
              })}
            </nav>

          </div>
        </div>
      </div>
    </div>
  );
}
