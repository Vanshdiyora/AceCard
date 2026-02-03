import { useState } from "react";
import { formatRole } from "../MobileWebsite";
import { uploadImage } from "../../../publicProfile/services/publicProfile.api";
import AvatarCropModal from "../../../../common/ui/AvatarCropModal";

/* ================= ALIGNMENT ================= */
type CardAlign = "left" | "center" | "right";

const ALIGN_MAP: Record<CardAlign, string> = {
  left: "text-left items-start",
  center: "text-center items-center",
  right: "text-right items-end",
};

const resolveTheme = (theme: any) => ({
  cardBg: theme.card_background || "#6B6E93",
  buttonBg: theme.button_color || "#A5A6AB",
  text: theme.card_text || "#EA3636",
  buttonText: theme.button_text || "#5F29F5",
});

export function ProfileSplit({
  profile,
  theme,
  user,
  layout,
  onProfileChange,
}: any) {
  const t = resolveTheme(theme);
  const align =
    ALIGN_MAP[(layout?.card_alignment as CardAlign) || "center"];

  return (
    <>
      <div
        className="rounded-2xl overflow-hidden shadow-md"
        style={{ backgroundColor: t.cardBg }}
      >
        {/* IMAGE */}
        <div className="relative h-[180px] w-full flex justify-center">
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              className="w-full h-full object-cover"
              alt="Avatar"
            />
          ) : (
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-xs font-semibold"
              style={{ backgroundColor: t.cardBg, color: t.text }}
            >
              No Profile
            </div>
          )}

          {/* 📸 FLOATING CAMERA */}
          <InlineAvatarUploader
            profile={profile}
            onChange={onProfileChange}
          />

          {/* 🔥 Fade bottom */}
          {layout?.is_fade && (
            <div
              className="absolute bottom-0 left-0 right-0 h-16"
              style={{
                background: `linear-gradient(to top, ${t.cardBg} 0%, rgba(0,0,0,0) 100%)`,
              }}
            />
          )}
        </div>
      </div>

      <div className={`px-4 pt-2 flex flex-col ${align}`}>
        <h2 className="font-semibold text-sm" style={{ color: t.text }}>
          {user?.name}
        </h2>

        <p className="text-xs opacity-90" style={{ color: t.text }}>
          {formatRole(user?.job_title || user?.role)} at {user?.vendor_name}
        </p>
      </div>
    </>
  );
}

/* ================= INLINE UPLOADER ================= */

function InlineAvatarUploader({
  profile,
  onChange,
}: {
  profile: any;
  onChange: (p: any) => void;
}) {
  const [cropFile, setCropFile] = useState<File | null>(null);

  const uploadCropped = async (blob: Blob) => {
    const file = new File([blob], "avatar.jpg", { type: "image/jpeg" });
    const res = await uploadImage(file);
    const url = res.data.url;

    // 🔒 ALWAYS respect custom_profile toggle
    const next = profile.custom_profile
      ? { ...profile, custom_profile_url: url }
      : { ...profile, avatar_url: url };

    onChange(next); // 👈 this now updates correctly
    setCropFile(null);
  };

  return (
    <>
      {/* 📸 FLOATING BUTTON */}
      <label className="absolute top-[54px] left-1/2 -translate-x-1/2 bg-orange-500 text-white p-3 rounded-full shadow-lg cursor-pointer hover:scale-105 transition">
        📷
        <input
          type="file"
          hidden
          accept="image/*"
          onChange={(e) =>
            e.target.files && setCropFile(e.target.files[0])
          }
        />
      </label>

      {cropFile && (
        <AvatarCropModal
          file={cropFile}
          onCancel={() => setCropFile(null)}
          onSave={uploadCropped}
        />
      )}
    </>
  );
}
