import { formatRole } from "../MobileWebsite";

type CardAlign = "left" | "center" | "right";

const ALIGN_MAP: Record<CardAlign, string> = {
  left: "text-left items-start",
  center: "text-center items-center",
  right: "text-right items-end",
};

const resolveTheme = (theme: any) => ({
  cardBg: theme.card_background || "#6B6E93",
  buttonBg: theme.button_color || "#A5A6AB",
  text: theme.card_text || "#EA3636",
  buttonText: theme.button_text || "#5F29F5",
});

export function ProfileSplit({
  profile,
  theme,
  user,
  layout,
}: any) {
  const t = resolveTheme(theme);
  const align =
    ALIGN_MAP[(layout?.card_alignment as CardAlign) || "center"];
const avatarUrl =
  profile.custom_profile
    ? profile.custom_profile_url || profile.avatar_url
    : profile.avatar_url;

  return (
    <> 
      <div
        className="rounded-2xl overflow-hidden shadow-md"
        style={{ backgroundColor: t.cardBg }}
      >
        <div className="relative h-[180px] w-full flex justify-center">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              className="w-full h-full object-cover"
              alt="Avatar"
            />
          ) : (
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-xs font-semibold"
              style={{ backgroundColor: t.cardBg, color: t.text }}
            >
              No Profile
            </div>
          )}

          {layout?.is_fade && (
            <div
              className="absolute bottom-0 left-0 right-0 h-16"
              style={{
                background: `linear-gradient(to top, ${layout.fade_color} 0%, rgba(0,0,0,0) 100%)`,
              }}
            />
          )}
        </div>
      </div>

      <div className={`px-4 pt-2 flex flex-col ${align}`}>
        <h2 className="font-semibold text-sm" style={{ color: t.text }}>
          {user?.name}
        </h2>

        <p className="text-xs opacity-90" style={{ color: t.text }}>
          {formatRole(profile.custom_job_role ||user?.job_title || user?.role)} at {user?.vendor_name}
        </p>
      </div>
    </>
  );
}
