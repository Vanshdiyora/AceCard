import { useAppSelector } from "../../../../app/hooks";

export default function CustomDomainTab() {
  const domain = useAppSelector((s) => s.settings.customDomain);

  return (
    <div className="bg-white border rounded-xl p-6 shadow-sm space-y-6">
      <h3 className="font-semibold text-lg">Custom Domain</h3>

      {/* Current Domain */}
      <div>
        <label className="text-sm text-gray-500">Current Domain</label>
        <div className="flex items-center gap-3 mt-1">
          <input
            className="w-full border rounded-lg px-3 py-2 bg-gray-100"
            value={domain.domain}
            readOnly
          />
          <button className="border px-4 py-2 rounded-lg bg-white">
            Configure
          </button>
        </div>
      </div>

      {/* Status Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="font-medium text-blue-700">
          {domain.message}
        </p>
        <p className="text-blue-600 text-sm">
          Setup completed on {domain.completedOn}
        </p>
      </div>

      {/* Custom Domain Field */}
      <div>
        <label className="text-sm text-gray-500">Custom Domain Name</label>
        <input
          className="w-full border rounded-lg px-3 py-2 bg-gray-100 mt-1"
          value="yourdomain.com"
          readOnly
        />
      </div>

      <button className="border px-4 py-2 rounded-lg bg-white">
        Request Domain Change
      </button>
    </div>
  );
}
