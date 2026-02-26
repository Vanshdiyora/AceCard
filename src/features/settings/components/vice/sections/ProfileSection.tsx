import { useState } from "react";
import { uploadImage } from "../../../../publicProfile/services/publicProfile.api";
import AvatarCropModal from "../../../../../common/ui/AvatarCropModal";
import { Toggle } from "../../../../teams/components/details/publicProfile/TeamMemberPublicProfileTab";
import { Camera } from "lucide-react";

export default function ProfileSection({
  profile,
  onChange,
  onCropToggle,
}: any) {
  const [cropFile, setCropFile] = useState<File | null>(null);

  /* ================= UPLOAD HANDLER ================= */

  const uploadCropped = async (blob: Blob) => {
    const file = new File([blob], "avatar.jpg", { type: "image/jpeg" });

    const res = await uploadImage(file);
    const url = res.data.url;

    // ✅ SAFELY UPDATE BOTH FIELDS
    const updatedProfile = {
      ...profile,
      custom_profile_url: profile.custom_profile
        ? url
        : profile.custom_profile_url,
      avatar_url: !profile.custom_profile
        ? url
        : profile.avatar_url,
    };

    onChange(updatedProfile);

    setCropFile(null);
    onCropToggle?.(false);
  };

  /* ================= TOGGLE HANDLER ================= */

  const handleToggle = (v: boolean) => {
    onChange({
      ...profile,
      custom_profile: v,
    });
  };

  /* ================= RESOLVE CURRENT IMAGE ================= */

  const currentImage = profile.custom_profile
    ? profile.custom_profile_url || profile.avatar_url
    : profile.avatar_url;

  /* ================= UI ================= */

  return (
    <div className="space-y-4">

      {/* Toggle */}
      <Toggle
        label="Use Custom Profile"
        value={profile.custom_profile}
        onChange={handleToggle}
      />

      {/* Image Section */}
      <div className="space-y-2">
        <Label>Profile Photo</Label>

        <ImageBox
          url={currentImage}
          onSelect={(file: File) => {
            setCropFile(file);
            onCropToggle?.(true);
          }}
        />
      </div>

      {/* Crop Modal */}
      {cropFile && (
        <AvatarCropModal
          file={cropFile}
          onCancel={() => {
            setCropFile(null);
            onCropToggle?.(false);
          }}
          onSave={uploadCropped}
        />
      )}
    </div>
  );
}

/* ================= UI COMPONENTS ================= */

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs uppercase tracking-wide text-gray-500">
      {children}
    </p>
  );
}

function ImageBox({ url, onSelect }: any) {
  return (
    <div className="space-y-1">
      <div className="group relative h-28 w-28 rounded-full overflow-hidden border border-white/40 shadow-md bg-gradient-to-br from-gray-50 to-gray-100">

        {/* Image */}
        {url ? (
          <img
            src={url}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 text-sm">
            <div className="w-10 h-10 rounded-full bg-white/80 flex items-center justify-center shadow">
              <Camera />
            </div>
            <span className="mt-2">Upload</span>
          </div>
        )}

        {/* Hover Overlay */}
        <label className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition">
          <span className="px-4 py-1.5 rounded-full bg-white/20 backdrop-blur border border-white/30 text-sm">
            Change
          </span>
          <input
            type="file"
            hidden
            accept="image/*"
            onChange={(e) =>
              e.target.files && onSelect(e.target.files[0])
            }
          />
        </label>
      </div>
    </div>
  );
}
