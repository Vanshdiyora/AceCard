import { useState } from "react";
import SettingsSidebar from "../components/SettingsSidebar";

import AccountSettings from "../components/AccountSettings";
import CRMIntegration from "../components/CRMIntegration";
import LeadConfiguration from "../components/LeadConfiguration";
// import CampaignSettings from "../components/CampaignSettings";
// import NotificationPreferences from "../components/NotificationPreferences";
import PublicProfileSettings from "../components/PublicProfileSettings";
// import VendorInformation from "../components/VendorInformation";
import SuggestedQuestions from "../components/SuggestedQuestions";

export default function SettingsPage() {
  const [active, setActive] = useState("account");

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-gray-600 mb-8">Manage your account configurations</p>

        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="w-64 sticky top-10 self-start">
            <SettingsSidebar active={active} onChange={setActive} />
          </div>

          {/* Content */}
          <div className="flex-1 rounded-3xl overflow-visible">
            {active === "account" && <AccountSettings />}
            {active === "crm" && <CRMIntegration />}
            {active === "lead" && <LeadConfiguration />}
            {active === "profile" && <PublicProfileSettings />}
            {active === "questions" && <SuggestedQuestions />}
          </div>
        </div>
      </div>
    </div>
  );
}
