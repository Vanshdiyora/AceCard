import { formatRole } from "../MobileWebsite";

/* ================= ALIGNMENT ================= */
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

  return (
    <div
      className="rounded-2xl overflow-hidden shadow-md"
      style={{ backgroundColor: t.cardBg }}
    >
      {/* IMAGE */}
      <div className="relative h-[180px] w-full">
        <img
          src={profile.avatar_url || ""}
          className="w-full h-full object-cover"
        />

        {/* 🔥 Fade bottom */}
        {layout?.is_fade && (
          <div
            className="absolute bottom-0 left-0 right-0 h-16"
            style={{
              background: `linear-gradient(to top, ${t.cardBg} 0%, rgba(0,0,0,0) 100%)`,
            }}
          />
        )}
      </div>

      {/* CONTENT */}
      <div className={`p-4 flex flex-col ${align}`}>
        <h2
          className="font-semibold text-sm"
          style={{ color: t.text }}
        >
          {user?.name}
        </h2>

        <p
          className="text-xs mt-1 opacity-90"
          style={{ color: t.buttonText }}
        >
          {formatRole(user?.job_title || user?.role)}
        </p>
      </div>
    </div>
  );
}
