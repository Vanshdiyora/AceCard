import { formatRole } from "../MobileWebsite";

/* helper */
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

export function ProfileCenter({
  profile,
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
    160
  );

  const ring = layout?.profile_width ?? 6;

  // 🔥 Only change image source based on layout.custom_profile
  const avatarSrc =
    (profile?.custom_profile && safeSrc(profile?.custom_profile_url)) ||
    safeSrc(profile?.avatar_url);

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

  return (
    <div className="flex justify-center mt-6">
      <div
        className={`w-full max-w-[300px] px-6 pt-10 pb-6 flex flex-col ${align}`}
      >
        {/* ================= AVATAR ================= */}
        <div className={`w-full flex ${avatarAlign}`}>
          <div
            className="flex items-center justify-center"
            style={{
              backgroundColor: "#9ca3af",
              padding: ring,
              borderRadius: "100%", // keep circular
              transition: "padding 150ms ease",
            }}
          >
            <div
              style={{
                backgroundColor: t.buttonBg,
                borderRadius: "100%", // keep circular
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
                    borderRadius: "100%", // always circular
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
            </div>
          </div>
        </div>

        {/* ================= TEXT ================= */}
        <h2 className="mt-3 text-base font-semibold" style={{ color: t.text }}>
          {user?.name}
        </h2>

        <p className="text-xs opacity-90" style={{ color: t.text }}>
          {formatRole(
            profile?.custom_job_role || user?.job_title || user?.role
          )}{" "}
          at {user?.vendor_name}
        </p>
      </div>
    </div>
  );
}