import { useState } from "react";
import { formatRole } from "../../MobilePublicSettings";
import { uploadImage } from "../../../../services/publicProfile.api";
import AvatarCropModal from "../../../../../../common/ui/AvatarCropModal";
import { Camera as ImageIcon } from "lucide-react";

/* ================= THEME HELPER ================= */
const resolveTheme = (theme: any) => ({
  cardBg: theme.card_background || "#FDE68A",
  buttonBg: theme.button_color || "#A5A6AB",
  text: theme.card_text || "#000000",
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

  /* ================= AVATAR SIZE ================= */
  const rawSizeBase = Number(layout?.profile_radius);
  const sizeBase = Number.isFinite(rawSizeBase) && rawSizeBase > 0 ? rawSizeBase : 40;

  const avatarSize = Math.min(
    Math.max(sizeBase * 2, 48),
    160
  );

  const rawRing = Number(layout?.profile_width);
  const ring = Number.isFinite(rawRing) && rawRing > 0 ? rawRing : 8;
  const BORDER_RADIUS = 999;

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

  /* ================= STATE ================= */
  const [cropFile, setCropFile] = useState<File | null>(null);

  /* ================= UPLOAD HANDLER ================= */
  const uploadCropped = async (blob: Blob) => {
    try {
      const file = new File([blob], "avatar.jpg", { type: "image/jpeg" });

      const res = await uploadImage(file);
      const url = res.data.url;
      
      const updatedProfile = {
        ...profile,
        avatar_url: !profile.custom_profile
        ? url
        : profile.avatar_url,
      };
      
      onProfileChange(updatedProfile);

      setCropFile(null);
    } catch (err) {
      console.error("Avatar upload failed:", err);
    }
  };
  return (
    <div className="flex justify-center">
      <div
        className={`w-full max-w-[300px] px-6 pt-10 pb-6 flex flex-col ${align}`}
      >
        {/* ================= AVATAR ================= */}
        <div className={`w-full flex ${avatarAlign} relative`}>
          {/* OUTER RING */}
          <div
            className="flex items-center justify-center transition-all duration-300"
            style={{
              backgroundColor: "#9ca3af",
              padding: ring,
              borderRadius: BORDER_RADIUS,
            }}
          >
            {/* INNER */}
            <div
              className="relative"
              style={{
                backgroundColor: t.buttonBg,
                borderRadius: BORDER_RADIUS,
              }}
            >
              {/* AVATAR IMAGE */}
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt="Avatar"
                  style={{
                    width: avatarSize,
                    height: avatarSize,
                    objectFit: "cover",
                    borderRadius: "100%",
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
                    borderRadius: "100%",
                    transition: "width 150ms ease, height 150ms ease",
                  }}
                >
                  {user?.name?.[0] || "?"}
                </div>
              )}

              {/* CAMERA BUTTON */}
              <label
                className="
                  absolute -bottom-3 left-1/2 -translate-x-1/2
                  bg-orange-500 text-white p-2 rounded-full
                  shadow-lg cursor-pointer
                  hover:scale-105 active:scale-95 transition
                  flex items-center justify-center
                "
                title="Change avatar"
              >
                <ImageIcon size={18} strokeWidth={2} />

                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;

                    setCropFile(file);

                    // allow re-uploading the same file again
                    e.target.value = "";
                  }}
                />
              </label>
            </div>
          </div>
        </div>

        {/* ================= TEXT ================= */}
        <h2
          className="mt-3 text-base font-semibold"
          style={{ color: t.text }}
        >
          {user?.name}
        </h2>

        <p className="text-xs opacity-90" style={{ color: t.text }}>
          {formatRole(
            profile?.custom_job_role ||
            user?.job_title ||
            user?.role
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