import { formatRole } from "../MobileWebsite";

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
}: any) {
  const t = resolveTheme(theme);

  /* ================= AVATAR LOGIC ================= */
  const sizeBase = layout?.profile_radius ?? 40;

  // Avatar size derived ONLY from profile_radius
  const avatarSize = Math.min(
    Math.max(sizeBase * 2, 48),
    140
  );

  const ring = Number(layout?.profile_width || 6);
  const BORDER_RADIUS = 100; // rounded-xl

  const align =
    ALIGN_MAP[(layout?.card_alignment as CardAlign) || "center"];

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
          <div
            className="h-full flex items-center justify-center text-xs text-gray-400"
            style={{ backgroundColor: t.cardBg }}
          />
        )}

        {/* ================= FADE ================= */}
        {layout?.is_fade && (
          <div
            className="absolute bottom-0 left-0 right-0 h-20"
            style={{
              background: `linear-gradient(
                to top,
                ${layout.fade_color || t.cardBg} 0%,
                rgba(0,0,0,0) 100%
              )`,
            }}
          />
        )}

        {/* ================= CONTENT ================= */}
        <div className={`absolute bottom-3 flex flex-col ${align}`}>
          {/* Avatar */}
          <div
            className="flex items-center justify-center"
            style={{
              backgroundColor: "#9ca3af",
              padding: ring,
              borderRadius: BORDER_RADIUS, // 👈 fixed rounded-xl
            }}
          >
            <div
              style={{
                backgroundColor: t.buttonBg,
                borderRadius: BORDER_RADIUS, // 👈 fixed rounded-xl
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
                    borderRadius: "100%", // 👈 always circular
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
                    borderRadius: "100%", // 👈 always circular
                  }}
                >
                  {user?.name?.[0] || "?"}
                </div>
              )}
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
      </div>
    </div>
  );
}
