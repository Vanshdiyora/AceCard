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
        className={`w-full max-w-[300px] rounded-3xl px-6 pt-10 pb-6 flex flex-col ${align}`}
      >
        {/* Avatar */}
        <div className={`w-full flex ${avatarAlign}`}>
          {/* OUTER FRAME (thickness controlled by profile_width) */}
          <div
            className="rounded-full flex items-center justify-center transition-all duration-300"
            style={{
              backgroundColor: "#9ca3af", // grey frame (change if needed)
              padding: `${layout?.profile_width || 6}px`,
            }}
          >
            {/* INNER COLOR RING */}
            <div
              className="rounded-full"
              style={{ backgroundColor: t.buttonBg }}
            >
              {/* AVATAR */}
              <img
                src={profile.avatar_url || ""}
                className="w-20 h-20 rounded-full object-cover"
              />
            </div>
          </div>
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
          style={{ color: t.text }}
        >
          {formatRole(user?.job_title || user?.role)}
        </p>
      </div>
    </div>
  );
}
