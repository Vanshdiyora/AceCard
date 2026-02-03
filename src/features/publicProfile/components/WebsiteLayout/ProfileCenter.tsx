import { useState } from "react";
import { formatRole } from "../MobileWebsite";
import { uploadImage } from "../../../publicProfile/services/publicProfile.api";
import AvatarCropModal from "../../../../common/ui/AvatarCropModal";

/* helper */
const resolveTheme = (theme: any) => ({
  cardBg: theme.card_background || "#6B6E93",
  buttonBg: theme.button_color || "#A5A6AB",
  text: theme.card_text || "#EA3636",
  buttonText: theme.button_text || "#5F29F5",
});

export function ProfileCenter({
  profile,
  theme,
  user,
  layout,
  onProfileChange, // 👈 NEW
}: any) {
  const t = resolveTheme(theme);

  const align =
    layout?.card_alignment === "left"
      ? "items-start text-left"
      : layout?.card_alignment === "right"
      ? "items-end text-right"
      : "items-center text-center";

  const avatarAlign =
    layout?.card_alignment === "left"
      ? "justify-start"
      : layout?.card_alignment === "right"
      ? "justify-end"
      : "justify-center";

  const [cropFile, setCropFile] = useState<File | null>(null);

  const uploadCropped = async (blob: Blob) => {
    const file = new File([blob], "avatar.jpg", { type: "image/jpeg" });
    const res = await uploadImage(file);
    const url = res.data.url;

    const next = profile.custom_profile
      ? { ...profile, custom_profile_url: url }
      : { ...profile, avatar_url: url };

    onProfileChange(next);
    setCropFile(null);
  };

  return (
    <div className="flex justify-center mt-6">
      <div
        className={`w-full max-w-[300px] rounded-3xl px-6 pt-10 pb-6 flex flex-col ${align}`}
      >
        {/* Avatar */}
        <div className={`w-full flex ${avatarAlign} relative`}>
          <div
            className="rounded-full flex items-center justify-center transition-all duration-300"
            style={{
              backgroundColor: "#9ca3af",
              padding: `${layout?.profile_width || 6}px`,
            }}
          >
            <div
              className="rounded-full relative"
              style={{ backgroundColor: t.buttonBg }}
            >
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  className="w-20 h-20 rounded-full object-cover"
                  alt="Avatar"
                />
              ) : (
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center text-xs font-semibold"
                  style={{ backgroundColor: t.cardBg, color: t.text }}
                >
                  {user?.name?.[0] || "?"}
                </div>
              )}

              {/* 📸 FLOATING CAMERA ICON */}
              <label className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-orange-500 text-white p-2.5 rounded-full shadow-lg cursor-pointer hover:scale-105 transition">
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
            </div>
          </div>
        </div>

        {/* Name */}
        <h2 className="mt-3 text-base font-semibold" style={{ color: t.text }}>
          {user?.name}
        </h2>

        {/* Role */}
        <p className="text-xs opacity-90" style={{ color: t.text }}>
          {formatRole(user?.job_title || user?.role)} at {user?.vendor_name}
        </p>

        {cropFile && (
          <AvatarCropModal
            file={cropFile}
            onCancel={() => setCropFile(null)}
            onSave={uploadCropped}
          />
        )}
      </div>
    </div>
  );
}
