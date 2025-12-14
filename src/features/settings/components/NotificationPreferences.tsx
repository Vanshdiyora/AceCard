import { useState } from "react";

export default function NotificationPreferences() {
  const [emailPrefs, setEmailPrefs] = useState({
    newLeads: true,
    campaignUpdates: true,
    crmErrors: false,
    renewals: true,
  });

  const [inAppPrefs, setInAppPrefs] = useState({
    newLeads: true,
    campaignUpdates: true,
    crmErrors: true,
    renewals: true,
  });

  const toggle = (type, key) => {
    if (type === "email")
      setEmailPrefs({ ...emailPrefs, [key]: !emailPrefs[key] });
    else
      setInAppPrefs({ ...inAppPrefs, [key]: !inAppPrefs[key] });
  };

  return (
    <div className="bg-white shadow p-8 rounded-xl border">
      <h2 className="text-xl font-semibold mb-6">Notification Preferences</h2>

      <h3 className="font-semibold mb-3">Email Notifications</h3>
      {Object.keys(emailPrefs).map((k) => (
        <label key={k} className="flex items-center gap-2 mb-2">
          <input type="checkbox" checked={emailPrefs[k]} onChange={() => toggle("email", k)} />
          {k}
        </label>
      ))}

      <h3 className="font-semibold mt-6 mb-3">In-App Notifications</h3>
      {Object.keys(inAppPrefs).map((k) => (
        <label key={k} className="flex items-center gap-2 mb-2">
          <input type="checkbox" checked={inAppPrefs[k]} onChange={() => toggle("inapp", k)} />
          {k}
        </label>
      ))}

      <button className="px-6 py-2 mt-6 bg-purple-600 text-white rounded-lg">
        Save
      </button>
    </div>
  );
}
