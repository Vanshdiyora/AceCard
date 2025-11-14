import { useAppSelector } from "../../app/hooks";
// import { updateProfile } from "../../features/Settings/SettingsSlice";

export default function ProfileTab() {
//   const dispatch = useAppDispatch();
  const profile = useAppSelector((s) => s.settings.profile);

  return (
    <div className="bg-white border rounded-xl p-6 shadow-sm space-y-6">
      <h3 className="font-semibold text-lg">Personal Information</h3>

      {/* Avatar + Upload */}
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-lg font-semibold">
          {profile.firstName.charAt(0)}
          {profile.lastName.charAt(0)}
        </div>

        <button className="border px-4 py-2 rounded-lg bg-white">
          Upload Photo
        </button>
      </div>

      {/* Form */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-gray-500">First Name</label>
          <input
            className="w-full border rounded-lg px-3 py-2 bg-gray-100"
            value={profile.firstName}
            readOnly
          />
        </div>

        <div>
          <label className="text-sm text-gray-500">Last Name</label>
          <input
            className="w-full border rounded-lg px-3 py-2 bg-gray-100"
            value={profile.lastName}
            readOnly
          />
        </div>

        <div className="col-span-2">
          <label className="text-sm text-gray-500">Email</label>
          <input
            className="w-full border rounded-lg px-3 py-2 bg-gray-100"
            value={profile.email}
            readOnly
          />
        </div>

        <div className="col-span-2">
          <label className="text-sm text-gray-500">Role</label>
          <input
            className="w-full border rounded-lg px-3 py-2 bg-gray-100"
            value={profile.role}
            readOnly
          />
        </div>
      </div>

      {/* Save Button */}
      <button className="bg-purple-600 text-white px-4 py-2 rounded-lg">
        Save Changes
      </button>
    </div>
  );
}
