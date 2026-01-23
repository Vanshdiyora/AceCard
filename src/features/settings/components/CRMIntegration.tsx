import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import {
  fetchIntegrations,
  disconnectIntegration,
  syncIntegration,
} from "../slice";
import { settingsService } from "../services/settings.service";
import type { CRMProvider } from "../types";
import OdooConnectModal from "./OdooConnectModal";
import BrandLoader from "../../../common/ui/BrandLoader";
import ResultModal from "../../../common/ui/ResultModal";

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

  const [resultModal, setResultModal] = useState({
    open: false,
    success: true,
    message: "",
  });

  useEffect(() => {
    dispatch(fetchIntegrations());
  }, [dispatch]);

  /* ---------------- CONNECT ---------------- */
  const connect = async (provider: CRMProvider) => {
    try {
      if (provider === "odoo") {
        setShowOdoo(true);
        return;
      }

      const url = await settingsService.getAuthUrl(provider);
      window.location.href = url;
    } catch {
      setResultModal({
        open: true,
        success: false,
        message: "Failed to start integration.",
      });
    }
  };

  /* ---------------- SYNC ---------------- */
  const handleSync = async (provider: CRMProvider) => {
    try {
      await dispatch(syncIntegration(provider)).unwrap();

      setResultModal({
        open: true,
        success: true,
        message: "Data synced successfully.",
      });
    } catch {
      setResultModal({
        open: true,
        success: false,
        message: "Sync failed. Please try again.",
      });
    }
  };

  /* ---------------- DISCONNECT ---------------- */
  const handleDisconnect = async (provider: CRMProvider) => {
    try {
      await dispatch(disconnectIntegration(provider)).unwrap();

      setResultModal({
        open: true,
        success: true,
        message: "Integration disconnected successfully.",
      });
    } catch {
      setResultModal({
        open: true,
        success: false,
        message: "Failed to disconnect integration.",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <BrandLoader />
      </div>
    );
  }

  if (error) {
    return <div className="p-8 text-red-600">{error}</div>;
  }

  return (
    <>
      <div className="bg-white shadow p-8 rounded-xl border">
        <h2 className="text-xl font-semibold mb-6">CRM Integration</h2>

        <div className="space-y-4">
          {PROVIDERS.map((p) => {
            const integration = data.find((i) => i.provider === p.id);

            const connected = integration?.connected === true;
            const syncing = integration?.syncing === true;
            const connecting = integration?.connecting === true;
            const disconnecting = integration?.disconnecting === true;

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

                <div className="flex items-center gap-3">
                  {connected && (
                    <button
                      onClick={() => handleSync(p.id)}
                      disabled={syncing}
                      className={`px-4 py-1 rounded border text-sm transition
                        ${
                          syncing
                            ? "text-gray-400 border-gray-300 cursor-not-allowed"
                            : "text-purple-600 border-purple-600 hover:bg-purple-50"
                        }
                      `}
                    >
                      {syncing ? "Syncing..." : "Sync"}
                    </button>
                  )}

                  {connected ? (
                    <button
                      onClick={() => handleDisconnect(p.id)}
                      disabled={disconnecting}
                      className={`px-4 py-1 rounded text-sm transition
                        ${
                          disconnecting
                            ? "text-gray-400 cursor-not-allowed"
                            : "text-red-600 hover:bg-red-50"
                        }
                      `}
                    >
                      {disconnecting ? "Disconnecting..." : "Disconnect"}
                    </button>
                  ) : (
                    <button
                      onClick={() => connect(p.id)}
                      disabled={connecting}
                      className={`px-4 py-1 rounded text-sm transition
                        ${
                          connecting
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-purple-600 text-white hover:bg-purple-700"
                        }
                      `}
                    >
                      {connecting ? "Connecting..." : "Connect"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {showOdoo && <OdooConnectModal onClose={() => setShowOdoo(false)} />}
      </div>

      {/* ---------- RESULT MODAL ---------- */}
      <ResultModal
        open={resultModal.open}
        success={resultModal.success}
        message={resultModal.message}
        onClose={() =>
          setResultModal({ open: false, success: true, message: "" })
        }
      />
    </>
  );
}
