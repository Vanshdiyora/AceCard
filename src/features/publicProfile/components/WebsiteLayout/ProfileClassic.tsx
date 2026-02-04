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
  const align =
    ALIGN_MAP[(layout?.card_alignment as CardAlign) || "center"];
  const ring = Number(layout?.profile_width || 6);

  return (
    <div>
      <div
        className="relative h-[220px] rounded-2xl overflow-hidden"
        style={{ backgroundColor: t.cardBg }}
      >
        {cover?.cover_url ? (
          <img
            src={cover.cover_url}
            className="w-full h-full object-cover"
            alt="Cover"
          />
        ) : (
          <div className="h-full flex items-center justify-center text-xs text-gray-400
           style={{ backgroundColor: t.cardBg }}">
            No cover image
          </div>
        )}

        {layout?.is_fade && (
          <div
            className="absolute bottom-0 left-0 right-0 h-20"
            style={{
              background: `linear-gradient(to top, ${t.cardBg} 0%, rgba(0,0,0,0) 100%)`,
            }}
          />
        )}

        <div className={`absolute bottom-3 flex flex-col ${align}`}>
          <div
            className="rounded-full flex items-center justify-center"
            style={{
              backgroundColor: "#9ca3af",
              padding: `${ring}px`,
            }}
          >
            <div
              className="rounded-full"
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
            </div>
          </div>

          <h2 className="mt-2 font-semibold text-sm" style={{ color: t.text }}>
            {user?.name}
          </h2>

          <p className="text-xs opacity-90" style={{ color: t.text }}>
            {formatRole(user?.job_title || user?.role)} at {user?.vendor_name}
          </p>
        </div>
      </div>
    </div>
  );
}
