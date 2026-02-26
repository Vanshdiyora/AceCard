import { useState } from "react";
import { formatRole } from "../../MobilePublicSettings";
import { uploadImage } from "../../../../services/publicProfile.api";
import AvatarCropModal from "../../../../../../common/ui/AvatarCropModal";
import { Camera as ImageIcon } from "lucide-react";
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
  onProfileChange,
}: any) {
  const t = resolveTheme(theme);

  /* ================= AVATAR SIZE LOGIC ================= */
  const sizeBase = layout?.profile_radius ?? 40;

  // avatar size derived ONLY from profile_radius
  const avatarSize = Math.min(
    Math.max(sizeBase * 2, 48), // min
    160                        // max
  );

  const ring = layout?.profile_width ?? 6;
  const BORDER_RADIUS = 999; // always circular outer ring

  /* ================= ALIGNMENT ================= */
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

  /* ================= UPLOAD HANDLER ================= */
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
        className={`w-full max-w-[300px] px-6 pt-10 pb-6 flex flex-col ${align}`}
      >
        {/* ================= AVATAR ================= */}
        <div className={`w-full flex ${avatarAlign} relative`}>
          {/* Outer ring */}
          <div
            className="flex items-center justify-center transition-all duration-300"
            style={{
              backgroundColor: "#9ca3af",
              padding: ring,
              borderRadius: BORDER_RADIUS,
            }}
          >
            {/* Inner background */}
            <div
              className="relative"
              style={{
                backgroundColor: t.buttonBg,
                borderRadius: BORDER_RADIUS,
              }}
            >
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt="Avatar"
                  style={{
                    width: avatarSize,
                    height: avatarSize,
                    objectFit: "cover",
                    borderRadius: "100%", // always circle
                    transition: "width 150ms ease, height 150ms ease",
                  }}
                />
              ) : (
                <div
                  className="flex items-center justify-center text-xs font-semibold"
                  style={{
                    width: avatarSize,
                    height: avatarSize,
                    backgroundColor: t.cardBg,
                    color: t.text,
                    borderRadius: "100%", // always circle
                    transition: "width 150ms ease, height 150ms ease",
                  }}
                >
                  {user?.name?.[0] || "?"}
                </div>
              )}

              {/* 📸 CAMERA BUTTON */}
              <label
                className="
    absolute -bottom-3 left-1/2 -translate-x-1/2
    bg-orange-500 text-white p-2 rounded-full
    shadow-lg cursor-pointer
    hover:scale-105 active:scale-95 transition
    flex items-center justify-center
  "
              >
                <ImageIcon size={18} strokeWidth={2} />

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

        {/* ================= TEXT ================= */}
        <h2 className="mt-3 text-base font-semibold" style={{ color: t.text }}>
          {user?.name}
        </h2>

        <p className="text-xs opacity-90" style={{ color: t.text }}>
          {formatRole(
            profile.custom_job_role || user?.job_title || user?.role
          )}{" "}
          at {user?.vendor_name}
        </p>

        {/* ================= CROP MODAL ================= */}
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
