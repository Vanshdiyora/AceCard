import { useRef, useState } from "react";
import AvatarCropModal from "../../../../../../common/ui/AvatarCropModal";
import CoverCropModal from "../../../../../../common/ui/CoverCropModal";
import { Image, Camera } from "lucide-react";
import { uploadImage } from "../../../../services/publicProfile.api";
import { formatRole } from "../../MobilePublicSettings";

type CardAlign = "left" | "center" | "right";

const ALIGN_MAP = {
  left: "items-start text-left left-4",
  center: "items-center text-center left-1/2 -translate-x-1/2",
  right: "items-end text-right right-4",
};

const resolveTheme = (theme: any) => ({
  cardBg: theme.card_background || "#6B6E93",
  buttonBg: theme.button_color || "#A5A6AB",
  text: theme.card_text || "#EA3636",
  buttonText: theme.button_text || "#5F29F5",
});

export function ProfileClassic({
  profile,
  cover,
  theme,
  user,
  layout,
  onProfileChange,
}: any) {
  const t = resolveTheme(theme);

  const align =
    ALIGN_MAP[(layout?.card_alignment as CardAlign) || "center"];

  /* ================= AVATAR SIZE LOGIC ================= */
  const sizeBase = layout?.profile_radius ?? 40;

  const avatarSize = Math.min(
    Math.max(sizeBase * 2, 48),
    160
  );

  const ring = Number(layout?.profile_width ?? 6);
  const BORDER_RADIUS = 999; // always circular

  const [cropFile, setCropFile] = useState<File | null>(null);
  const [isCoverCropping, setIsCoverCropping] = useState(false);
  const coverFileRef = useRef<File | null>(null);

  /* ================= AVATAR UPLOAD ================= */
  const uploadAvatar = async (blob: Blob) => {
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

  /* ================= COVER UPLOAD ================= */
  const openCoverPicker = () => {
    const el = document.getElementById("coverInput") as HTMLInputElement;
    el?.click();
  };

  const uploadCover = async (blob: Blob) => {
    const file = new File([blob], "cover.jpg", { type: "image/jpeg" });
    const res = await uploadImage(file);
    const url = res.data.url;

    onProfileChange({
      ...profile,
      cover: {
        ...cover,
        cover_url: url,
      },
    });

    setIsCoverCropping(false);
  };

  return (
    <div>
      <div
        className="relative h-[220px] rounded-2xl overflow-hidden"
        style={{ backgroundColor: t.cardBg }}
      >
        {/* ================= COVER ================= */}
        {cover?.cover_url ? (
          <img
            src={cover.cover_url}
            className="w-full h-full object-cover"
            alt="Cover"
          />
        ) : (
          <div className="h-full bg-gray-100" />
        )}

        {/* COVER EDIT BUTTON */}
        {!cover?.locked && (
          <button
            onClick={openCoverPicker}
            className="
              absolute top-3 left-3 z-30
              h-10 w-10 rounded-full shadow
              flex items-center justify-center
              transition hover:scale-105
              bg-orange-500 text-white
            "
            title="Change cover"
          >
            <Image size={18} />
            <input
              id="coverInput"
              type="file"
              hidden
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;

                coverFileRef.current = file;
                setIsCoverCropping(true);

                // allow selecting same image again
                e.target.value = "";
              }}
            />
          </button>
        )}

        {/* DARK OVERLAY */}
        <div className="absolute inset-0 bg-black/40 pointer-events-none" />

        {/* FADE */}
        {layout?.is_fade && (
          <div
            className="absolute bottom-0 left-0 right-0 h-20"
            style={{
              background: `linear-gradient(to top, ${layout.fade_color} 0%, rgba(0,0,0,0) 100%)`,
            }}
          />
        )}

        {/* ================= AVATAR + TEXT ================= */}
        <div className={`absolute bottom-3 flex flex-col ${align}`}>
          {/* Avatar ring */}
          <div
            className="flex items-center justify-center transition-all duration-300 relative"
            style={{
              backgroundColor: "#9ca3af",
              padding: ring,
              borderRadius: BORDER_RADIUS,
            }}
          >
            {/* Inner */}
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
                  }}
                >
                  {user?.name?.[0] || "?"}
                </div>
              )}

              {/* AVATAR EDIT BUTTON */}
              <label
                className="
                  absolute -bottom-3 left-1/2 -translate-x-1/2
                  h-10 w-10 rounded-full shadow-lg
                  flex items-center justify-center
                  cursor-pointer transition hover:scale-105
                  bg-orange-500 text-white
                "
                title="Change avatar"
              >
                <Camera size={18} />
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;

                    setCropFile(file);

                    // allow selecting same image again
                    e.target.value = "";
                  }}
                />
              </label>
            </div>
          </div>

          <h2 className="mt-2 font-semibold text-sm" style={{ color: t.text }}>
            {user?.name}
          </h2>

          <p className="text-xs opacity-90" style={{ color: t.text }}>
            {formatRole(
              profile.custom_job_role || user?.job_title || user?.role
            )}{" "}
            at {user?.vendor_name}
          </p>
        </div>

        {/* ================= MODALS ================= */}
        {cropFile && (
          <AvatarCropModal
            file={cropFile}
            onCancel={() => setCropFile(null)}
            onSave={uploadAvatar}
          />
        )}

        {isCoverCropping && coverFileRef.current && (
          <CoverCropModal
            file={coverFileRef.current}
            onCancel={() => setIsCoverCropping(false)}
            onSave={uploadCover}
          />
        )}
      </div>
    </div>
  );
}
