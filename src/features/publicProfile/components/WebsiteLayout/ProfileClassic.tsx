import { formatRole } from "../MobileWebsite";

type CardAlign = "left" | "center" | "right";

const ALIGN_MAP = {
  left: "items-start text-left left-4",
  center: "items-center text-center left-1/2 -translate-x-1/2",
  right: "items-end text-right right-4",
};

const resolveTheme = (theme: any) => ({
  cardBg: theme.card_background || "#FDE68A",
  buttonBg: theme.button_color || "#A5A6AB",
  text: theme.card_text || "#000000",
  buttonText: theme.button_text || "#5F29F5",
});

const safeSrc = (value?: string | null): string | null => {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed !== "" ? trimmed : null;
};

export function ProfileClassic({
  profile,
  cover,
  theme,
  user,
  layout,
}: any) {
  const t = resolveTheme(theme);

  const sizeBase = layout?.profile_radius ?? 40;

  // Avatar size derived ONLY from profile_radius
  const avatarSize = Math.min(Math.max(sizeBase * 2, 48), 140);

  const ring = Number(layout?.profile_width || 6);

  // 🔥 Only change image source based on custom_profile
  const avatarSrc =
    (profile?.custom_profile && safeSrc(profile?.custom_profile_url)) ||
    safeSrc(profile?.avatar_url);

  const align =
    ALIGN_MAP[(layout?.card_alignment as CardAlign) || "center"];

  return (
    <div>
      <div
        className="relative h-[220px] rounded-2xl overflow-hidden"
        style={{ backgroundColor: t.cardBg }}
      >
        {/* ================= COVER ================= */}
        {safeSrc(cover?.cover_url) ? (
          <img
            src={safeSrc(cover?.cover_url)!}
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
          {/* ================= AVATAR ================= */}
          <div
            className="flex items-center justify-center"
            style={{
              backgroundColor: "#9ca3af",
              padding: ring,
              borderRadius: "100%", // keep circular ring
            }}
          >
            <div
              style={{
                backgroundColor: t.buttonBg,
                borderRadius: "100%", // keep circular inner ring
              }}
            >
              {avatarSrc ? (
                <img
                  src={avatarSrc}
                  alt="Avatar"
                  style={{
                    width: avatarSize,
                    height: avatarSize,
                    objectFit: "cover",
                    borderRadius: "100%", // keep circular mask
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
            </div>
          </div>

          {/* ================= NAME ================= */}
          <h2 className="mt-2 font-semibold text-sm" style={{ color: t.text }}>
            {user?.name}
          </h2>

          {/* ================= ROLE ================= */}
          <p className="text-xs opacity-90" style={{ color: t.text }}>
            {formatRole(
              profile?.custom_job_role || user?.job_title || user?.role
            )}{" "}
            at {user?.vendor_name}
          </p>
        </div>
      </div>
    </div>
  );
}