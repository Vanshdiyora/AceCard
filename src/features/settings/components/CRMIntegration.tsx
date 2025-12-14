export default function CRMIntegration() {
  return (
    <div className="bg-white shadow p-8 rounded-xl border">
      <h2 className="text-xl font-semibold mb-6">CRM Integration</h2>

      <p className="text-gray-600 mb-4">Connected CRMs</p>

      <div className="border rounded-lg p-4 mb-6">
        <p>• HubSpot (Active)</p>
        <p>• Zoho CRM (Disconnected)</p>
      </div>

      <button className="px-6 py-2 bg-purple-600 text-white rounded-lg">
        Manage Integrations
      </button>
    </div>
  );
}
