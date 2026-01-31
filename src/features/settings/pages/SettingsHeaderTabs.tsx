interface Props {
  active: string;
  onChange: (v: string) => void;
}

const tabs = [
  { id: "account", label: "Account" },
  { id: "crm", label: "CRM" },
  { id: "lead", label: "Leads" },
  { id: "questions", label: "Suggested Questions" },
  { id: "profile", label: "Public Profile" },
];

export default function SettingsHeaderTabs({ active, onChange }: Props) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-2 flex gap-2 sticky top-4 z-20">
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all
            ${
              active === t.id
                ? "bg-purple-600 text-white shadow-md scale-[1.03]"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
