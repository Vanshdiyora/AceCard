import { useState } from "react";
import { Toggle } from "../../../../teams/components/details/publicProfile/TeamMemberPublicProfileTab";
import { uploadImage } from "../../../services/publicProfile.api";
import AvatarCropModal from "../../../../../common/ui/AvatarCropModal";

export default function ProfileSection({
  profile,
  onChange,
  onCropToggle,
}: any) {
  const [cropFile, setCropFile] = useState<File | null>(null);

  const uploadCropped = async (blob: Blob) => {
    const file = new File([blob], "avatar.jpg", { type: "image/jpeg" });
    const res = await uploadImage(file);
    const url = res.data.url;

    // 🔒 FINAL GUARD — always obey toggle
    const next = profile.custom_profile
      ? { ...profile, custom_profile_url: url }
      : { ...profile, avatar_url: url };

    onChange(next);
    setCropFile(null);
    onCropToggle?.(false);
  };

  return (
    <div>
      <Toggle
        label="Use Custom Profile"
        value={profile.custom_profile}
        onChange={(v:any) =>
          onChange({
            ...profile,
            custom_profile: v,
            ...(v
              ? { custom_profile_url: profile.custom_profile_url || "" }
              : {}),
          })
        }
      />

      <div className="flex flex-col md:flex-row gap-8 items-start mt-2">
        <div className="space-y-2">
          <Label>Profile Photo</Label>

          <ImageBox
            url={
              profile.custom_profile
                ? profile.custom_profile_url || profile.avatar_url
                : profile.avatar_url
            }
            onSelect={(file: File) => {
              setCropFile(file);
              onCropToggle?.(true);
            }}
          />
        </div>

        <div className="flex-1 space-y-2">
          <Label>Description</Label>
          <textarea
            placeholder="Write something about yourself..."
            className="w-full min-h-[120px] rounded-xl border border-gray-200 bg-white/70 px-4 py-3"
            value={profile.description || ""}
            onChange={(e) =>
              onChange({ ...profile, description: e.target.value })
            }
          />
        </div>
      </div>

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

/* ================= UI ================= */

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs uppercase tracking-wide text-gray-500">
      {children}
    </p>
  );
}

function ImageBox({ url, wide, onSelect }: any) {
  return (
    <div className="space-y-1">
      <div
        className={`group relative rounded-2xl overflow-hidden border border-white/40 shadow-md bg-gradient-to-br from-gray-50 to-gray-100 ${
          wide ? "h-44 w-full" : "h-28 w-28"
        }`}
      >
        {url ? (
          <img
            src={url}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 text-sm">
            <div className="w-10 h-10 rounded-full bg-white/80 flex items-center justify-center shadow">
              📷
            </div>
            <span className="mt-2">Upload</span>
          </div>
        )}

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
