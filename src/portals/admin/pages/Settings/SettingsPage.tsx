import { useState } from "react";
import OrganizationTab from "./OrganizationTab";
import ProfileTab from "./ProfileTab";
import NotificationsTab from "./NotificationsTab";
import CustomDomainTab from "./CustomDomainTab";

export default function SettingsPage() {
  const [tab, setTab] = useState("organization");

  const tabs = [
    { id: "organization", label: "Organization" },
    { id: "profile", label: "Profile" },
    { id: "notifications", label: "Notifications" },
    { id: "domain", label: "Custom Domain" }
  ];

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-semibold">Settings</h2>
      <p className="text-gray-500">Manage your account and organization settings</p>

      {/* Tabs UI */}
      <div className="flex items-center bg-gray-100 rounded-full p-1 w-fit">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-5 py-2 text-sm font-medium transition ${
              tab === t.id
                ? "bg-white shadow-sm rounded-full"
                : "text-gray-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === "organization" && <OrganizationTab />}
      {tab === "profile" && <ProfileTab />}
      {tab === "notifications" && <NotificationsTab />}
      {tab === "domain" && <CustomDomainTab />}
    </div>
  );
}
