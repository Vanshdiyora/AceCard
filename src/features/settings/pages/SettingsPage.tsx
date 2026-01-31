import { useState } from "react";
import SettingsSidebar from "../components/SettingsSidebar";
import SettingsHeaderTabs from "./SettingsHeaderTabs";

import AccountSettings from "../components/AccountSettings";
import CRMIntegration from "../components/CRMIntegration";
import LeadConfiguration from "../components/LeadConfiguration";
import PublicProfileSettings from "../components/PublicProfileSettings";
import SuggestedQuestions from "../components/SuggestedQuestions";

export default function SettingsPage() {
  const [active, setActive] = useState("account");
  const isProfile = active === "profile";

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* HEADER (title always, tabs only for profile) */}
        <div className="flex items-center justify-between mb-8">
          {/* Title */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-600 text-sm">
              Manage your account configurations
            </p>
          </div>

          {/* Tabs only when profile */}
          {isProfile && (
            <SettingsHeaderTabs active={active} onChange={setActive} />
          )}
        </div>

        {/* BODY */}
        {isProfile ? (
          <PublicProfileSettings />
        ) : (
          <div className="flex gap-8">
            <div className="w-64 sticky top-20 self-start">
              <SettingsSidebar active={active} onChange={setActive} />
            </div>

            <div className="flex-1 rounded-3xl overflow-visible">
              {active === "account" && <AccountSettings />}
              {active === "crm" && <CRMIntegration />}
              {active === "lead" && <LeadConfiguration />}
              {active === "questions" && <SuggestedQuestions />}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
