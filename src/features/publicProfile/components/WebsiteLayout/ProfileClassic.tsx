import { useRef, useState } from "react";
import { formatRole } from "../MobileWebsite";
import { uploadImage } from "../../../publicProfile/services/publicProfile.api";
import AvatarCropModal from "../../../../common/ui/AvatarCropModal";
import CoverCropModal from "../../../../common/ui/CoverCropModal";
import { Image, Camera } from "lucide-react";


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
  const ring = Number(layout?.profile_width || 6);

  const [cropFile, setCropFile] = useState<File | null>(null);
  const [isCoverCropping, setIsCoverCropping] = useState(false);
  const coverFileRef = useRef<File | null>(null);

  /* ---------- AVATAR ---------- */
  const uploadAvatar = async (blob: Blob) => {
    const file = new File([blob], "avatar.jpg", { type: "image/jpeg" });
    const res = await uploadImage(file);
    const url = res.data.url;

    const next = profile.custom_profile
      ? { ...profile, custom_profile_url: url }
      : { ...profile, avatar_url: url };

    onProfileChange(next);
    setCropFile(null);
  };

  /* ---------- COVER ---------- */
  const openCoverPicker = () => {
    const el = document.getElementById("coverInput") as HTMLInputElement;
    el?.click();
  };

  const uploadCover = async (blob: Blob) => {
    const file = new File([blob], "cover.jpg", { type: "image/jpeg" });
    const res = await uploadImage(file);
    const url = res.data.url;

    onProfileChange((prev: any) => ({
      ...prev,
      cover: { ...prev.cover, cover_url: url },
      profile: { ...prev.profile }, // keep ref change
    }));

    setIsCoverCropping(false);
  };

  return (
    <div>
      <div
        className="relative h-[220px] rounded-2xl overflow-hidden"
        style={{ backgroundColor: t.cardBg }}
      >
        {/* COVER */}
        {cover?.cover_url ? (
          <img
            src={cover.cover_url}
            className="w-full h-full object-cover"
            alt="Cover"
          />
        ) : (
          <div className="h-full flex items-center justify-center text-xs text-gray-400 bg-gray-100">
            No cover image
          </div>
        )}

        {/* FLOATING BUTTON */}
        <button
          onClick={openCoverPicker}
          className="absolute top-3 left-3 z-30 h-10 w-10 rounded-full shadow
    flex items-center justify-center transition hover:scale-105
    bg-orange-500 text-white"
          title="Change cover"
        >
          <Image size={18} />
          <input
            id="coverInput"
            type="file"
            hidden
            accept="image/*"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                coverFileRef.current = e.target.files[0];
                setIsCoverCropping(true);
              }
            }}
          />
        </button>

        {/* VISUAL OVERLAY */}
        <div className="absolute inset-0 bg-black/40 pointer-events-none" />

        {layout?.is_fade && (
          <div
            className="absolute bottom-0 left-0 right-0 h-20"
            style={{
              background: `linear-gradient(to top, ${t.cardBg} 0%, rgba(0,0,0,0) 100%)`,
            }}
          />
        )}

        {/* AVATAR + TEXT */}
        <div className={`absolute bottom-3 flex flex-col ${align}`}>
          <div
            className="rounded-full flex items-center justify-center transition-all duration-300 relative"
            style={{
              backgroundColor: "#9ca3af",
              padding: `${ring}px`,
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

              {/* AVATAR BUTTON */}
              <label
                className="absolute -bottom-3 left-1/2 -translate-x-1/2 h-10 w-10 rounded-full shadow-lg
    flex items-center justify-center cursor-pointer transition hover:scale-105
    bg-orange-500 text-white"
                title="Change avatar"
              >
                <Camera size={18} />
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

          <h2 className="mt-2 font-semibold text-sm" style={{ color: t.text }}>
            {user?.name}
          </h2>

          <p className="text-xs opacity-90" style={{ color: t.text }}>
            {formatRole(user?.job_title || user?.role)} at {user?.vendor_name}
          </p>
        </div>

        {/* MODALS */}
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
