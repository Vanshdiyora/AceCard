import { useState } from "react";
import SettingsSidebar from "../components/SettingsSidebar";

import AccountSettings from "../components/AccountSettings";
import CRMIntegration from "../components/CRMIntegration";
import LeadConfiguration from "../components/LeadConfiguration";
import CampaignSettings from "../components/CampaignSettings";
import NotificationPreferences from "../components/NotificationPreferences";
import PublicProfileSettings from "../components/PublicProfileSettings";
import VendorInformation from "../components/VendorInformation";

export default function SettingsPage() {
  const [active, setActive] = useState("account");

  return (
    <div className="p-8 w-full">
      <h1 className="text-3xl font-semibold mb-2">Settings</h1>
      <p className="text-gray-600 mb-8">Manage your account configurations</p>

      <div className="flex gap-6">
        <SettingsSidebar active={active} onChange={setActive} />

        <div className="flex-1">
          {active === "account" && <AccountSettings />}
          {active === "crm" && <CRMIntegration />}
          {active === "lead" && <LeadConfiguration />}
          {active === "campaign" && <CampaignSettings />}
          {active === "notifications" && <NotificationPreferences />}
          {active === "profile" && <PublicProfileSettings />}
          {active === "vendor" && <VendorInformation />}
        </div>
      </div>
    </div>
  );
}
