import { useState } from "react";

export default function CampaignSettings() {
  const [duration, setDuration] = useState<number>(30);
  const [autoArchive, setAutoArchive] = useState<boolean>(true);

  return (
    <div className="bg-white shadow p-8 rounded-xl border">
      <h2 className="text-xl font-semibold mb-6">Campaign Settings</h2>

      <label className="block mb-4">
        Default Campaign Duration (days)
        <input
          type="number"
          className="border rounded-lg w-full px-3 py-2 mt-1"
          value={duration}
          onChange={(e) => setDuration(Number(e.target.value))}
        />
      </label>

      <label className="flex items-center gap-2 mb-8">
        <input
          type="checkbox"
          checked={autoArchive}
          onChange={() => setAutoArchive((prev) => !prev)}
        />
        Auto-archive expired campaigns
      </label>

      <button className="px-6 py-2 bg-purple-600 text-white rounded-lg">
        Save
      </button>
    </div>
  );
}
