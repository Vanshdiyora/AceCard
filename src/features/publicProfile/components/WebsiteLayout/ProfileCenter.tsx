import { formatRole } from "../MobileWebsite";

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

  return (
    <div className="flex justify-center mt-6">
      <div
        className={`w-full max-w-[300px] rounded-3xl px-6 pt-10 pb-6 flex flex-col shadow-md ${align}`}
      >
        {/* Avatar */}
        <div className={`w-full flex ${avatarAlign}`}>
          <img
            src={profile.avatar_url || ""}
            className="w-20 h-20 rounded-full object-cover shadow-md border"
            style={{ borderColor: t.buttonBg }}
          />
        </div>

        {/* Name */}
        <h2
          className="mt-3 text-base font-semibold"
          style={{ color: t.text }}
        >
          {user?.name}
        </h2>

        {/* Role */}
        <p
          className="text-xs mt-1"
          style={{ color: t.buttonText }}
        >
          {formatRole(user?.job_title || user?.role)}
        </p>
      </div>
    </div>
  );
}
