import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { fetchIntegrations, disconnectIntegration } from "../slice";
import { settingsService } from "../services/settings.service";
import type { CRMProvider } from "../types";
import OdooConnectModal from "./OdooConnectModal";

const PROVIDERS: { id: CRMProvider; name: string }[] = [
  { id: "hubspot", name: "HubSpot" },
  { id: "zoho", name: "Zoho CRM" },
  { id: "salesforce", name: "Salesforce" },
  { id: "odoo", name: "Odoo" },
];

export default function CRMIntegration() {
  const dispatch = useAppDispatch();
  const { data, loading, error } = useAppSelector(
    (s) => s.settings.integrations
  );
  const [showOdoo, setShowOdoo] = useState(false);

  useEffect(() => {
    dispatch(fetchIntegrations());
  }, [dispatch]);

  const connect = async (provider: CRMProvider) => {
    try {
      if (provider === "odoo") {
        setShowOdoo(true);
        return;
      }

      const url = await settingsService.getAuthUrl(provider);
      window.location.href = url;
    } catch (err) {
      console.error("Failed to start integration", err);
      alert("Failed to start integration");
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;

  return (
    <div className="bg-white shadow p-8 rounded-xl border">
      <h2 className="text-xl font-semibold mb-6">CRM Integration</h2>

      <div className="space-y-4">
        {PROVIDERS.map((p) => {
          const integration = data.find((i) => i.provider === p.id);
          const connected = integration?.connected === true;

          return (
            <div
              key={p.id}
              className="flex items-center justify-between border p-4 rounded-lg"
            >
              <div>
                <p className="font-medium">{p.name}</p>
                <p className="text-sm text-gray-500">
                  {connected ? "Connected" : "Not connected"}
                </p>
              </div>

              {connected ? (
                <button
                  onClick={() => dispatch(disconnectIntegration(p.id))}
                  className="px-4 py-1 rounded text-red-600 hover:bg-red-50"
                >
                  Disconnect
                </button>
              ) : (
                <button
                  onClick={() => connect(p.id)}
                  className="px-4 py-1 rounded bg-purple-600 text-white hover:bg-purple-700"
                >
                  Connect
                </button>
              )}
            </div>
          );
        })}
      </div>

      {showOdoo && <OdooConnectModal onClose={() => setShowOdoo(false)} />}
    </div>
  );
}
