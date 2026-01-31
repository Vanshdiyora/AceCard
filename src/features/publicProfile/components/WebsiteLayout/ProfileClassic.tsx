import { formatRole } from "../MobileWebsite";
import { ProfileActions } from "./ProfileActions";

/* ================= ALIGNMENT MAP ================= */
type CardAlign = "left" | "center" | "right";
const ALIGN_MAP = {
  left: "items-start text-left left-4 -translate-x-0",
  center: "items-center text-center left-1/2 -translate-x-1/2",
  right: "items-end text-right right-4 left-auto translate-x-0",
};

export function ProfileClassic({
  profile,
  cover,
  theme,
  user,
  layout,
  onConnect,
}: any) {
  const align =
    ALIGN_MAP[
    (layout?.card_alignment as CardAlign) || "center"
    ];

  return (
    <div>
      <div className="relative h-[220px] rounded-2xl overflow-hidden">
        {/* Cover */}
        <img
          src={cover?.cover_url || ""}
          className="w-full h-full object-cover"
        />

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/40" />

        {/* 🔥 Fade bottom only if enabled */}
        {layout?.is_fade && (
          <div
            className="absolute bottom-0 left-0 right-0 h-20"
            style={{
              background: `linear-gradient(to top, ${theme.background_color || "#000"
                } 0%, rgba(0,0,0,0) 100%)`,
            }}
          />
        )}

        {/* Vendor name */}
        <div
          className={`absolute top-4 text-sm font-semibold px-4`}
          style={{ color: theme.accent_color }}
        >
          {user?.vendor_name}
        </div>

        {/* Avatar + text */}
        <div
          className={`absolute bottom-3 flex flex-col ${align}`}
        >
          <div className="w-24 h-24 rounded-full bg-black shadow-lg flex items-center justify-center">
            <img
              src={profile.avatar_url || ""}
              className="w-20 h-20 rounded-full object-cover"
            />
          </div>

          <h2
            className="mt-2 font-semibold"
            style={{ color: theme.text_color }}
          >
            {user?.name}
          </h2>

          <p
            className="text-xs"
            style={{ color: theme.accent_color }}
          >
            {formatRole(user?.job_title || user?.role)}
          </p>
        </div>
      </div>

      <ProfileActions
        user={user}
        theme={theme}
        onConnect={onConnect}
      />
    </div>
  );
}
