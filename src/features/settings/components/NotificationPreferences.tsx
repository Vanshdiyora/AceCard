import { useState } from "react";

type NotificationPrefs = {
  newLeads: boolean;
  campaignUpdates: boolean;
  crmErrors: boolean;
  renewals: boolean;
};

const prefKeys = [
  "newLeads",
  "campaignUpdates",
  "crmErrors",
  "renewals",
] as const;

type PrefKey = typeof prefKeys[number];
type PrefType = "email" | "inapp";

export default function NotificationPreferences() {
  const [emailPrefs, setEmailPrefs] = useState<NotificationPrefs>({
    newLeads: true,
    campaignUpdates: true,
    crmErrors: false,
    renewals: true,
  });

  const [inAppPrefs, setInAppPrefs] = useState<NotificationPrefs>({
    newLeads: true,
    campaignUpdates: true,
    crmErrors: true,
    renewals: true,
  });

  const toggle = (type: PrefType, key: PrefKey) => {
    if (type === "email") {
      setEmailPrefs((prev) => ({
        ...prev,
        [key]: !prev[key],
      }));
    } else {
      setInAppPrefs((prev) => ({
        ...prev,
        [key]: !prev[key],
      }));
    }
  };

  return (
    <div className="bg-white shadow p-8 rounded-xl border">
      <h2 className="text-xl font-semibold mb-6">
        Notification Preferences
      </h2>

      {/* Email */}
      <h3 className="font-semibold mb-3">Email Notifications</h3>
      {prefKeys.map((key) => (
        <label key={key} className="flex items-center gap-2 mb-2 capitalize">
          <input
            type="checkbox"
            checked={emailPrefs[key]}
            onChange={() => toggle("email", key)}
          />
          {key.replace(/([A-Z])/g, " $1")}
        </label>
      ))}

      {/* In App */}
      <h3 className="font-semibold mt-6 mb-3">In-App Notifications</h3>
      {prefKeys.map((key) => (
        <label key={key} className="flex items-center gap-2 mb-2 capitalize">
          <input
            type="checkbox"
            checked={inAppPrefs[key]}
            onChange={() => toggle("inapp", key)}
          />
          {key.replace(/([A-Z])/g, " $1")}
        </label>
      ))}

      <button className="px-6 py-2 mt-6 bg-purple-600 text-white rounded-lg">
        Save
      </button>
    </div>
  );
}
