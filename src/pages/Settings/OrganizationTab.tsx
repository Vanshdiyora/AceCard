import { useAppSelector } from "../../app/hooks";

export default function OrganizationTab() {
  const org = useAppSelector((s) => s.settings.organization);

  return (
    <div className="bg-white border rounded-xl p-6 shadow-sm space-y-6">
      <h3 className="font-semibold text-lg">Organization Details</h3>

      <div className="flex items-center gap-4">
        {/* Logo */}
        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-lg font-semibold">
          AC
        </div>

        <button className="border px-4 py-2 rounded-lg bg-white">
          Upload Logo
        </button>
      </div>

      {/* Form */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-gray-500">Organization Name</label>
          <input
            className="w-full border rounded-lg px-3 py-2 bg-gray-100"
            value={org.orgName}
            readOnly
          />
        </div>

        <div>
          <label className="text-sm text-gray-500">Industry</label>
          <input className="w-full border rounded-lg px-3 py-2 bg-gray-100" value={org.industry} readOnly />
        </div>

        <div>
          <label className="text-sm text-gray-500">Currency</label>
          <input className="w-full border rounded-lg px-3 py-2 bg-gray-100" value={org.currency} readOnly />
        </div>

        <div>
          <label className="text-sm text-gray-500">Locale</label>
          <input className="w-full border rounded-lg px-3 py-2 bg-gray-100" value={org.locale} readOnly />
        </div>
      </div>

      <button className="bg-purple-600 text-white px-4 py-2 rounded-lg">
        Save Changes
      </button>
    </div>
  );
}
