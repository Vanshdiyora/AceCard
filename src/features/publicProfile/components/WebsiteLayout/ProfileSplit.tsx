import { ProfileActions } from "./ProfileActions";
import { formatRole } from "../MobileWebsite";

/* ================= ALIGNMENT ================= */
type CardAlign = "left" | "center" | "right";

const ALIGN_MAP: Record<CardAlign, string> = {
  left: "text-left items-start",
  center: "text-center items-center",
  right: "text-right items-end",
};

export function ProfileSplit({
  profile,
  theme,
  user,
  layout,
  onConnect,
}: any) {
  const align =
    ALIGN_MAP[(layout?.card_alignment as CardAlign) || "center"];

  return (
    <div className="rounded-2xl overflow-hidden">
      {/* Cover Image */}
      <div className="relative h-[180px] w-full">
        <img
          src={profile.avatar_url || ""}
          className="w-full h-full object-cover"
        />

        {/* 🔥 Fade bottom of image if enabled */}
        {layout?.is_fade && (
          <div
            className="absolute bottom-0 left-0 right-0 h-16"
            style={{
              background: `linear-gradient(to top, ${
                theme.background_color || "#000"
              } 0%, rgba(0,0,0,0) 100%)`,
            }}
          />
        )}
      </div>

      {/* Content */}
      <div className={`p-4 flex flex-col ${align}`}>
        <h2
          className="font-semibold"
          style={{ color: theme.text_color }}
        >
          {user?.name}
        </h2>

        <p
          className="text-xs mt-1"
          style={{ color: theme.accent_color }}
        >
          {formatRole(user?.job_title || user?.role)}
        </p>

        <div className="mt-4 w-full">
          <ProfileActions
            user={user}
            theme={theme}
            onConnect={onConnect}
          />
        </div>
      </div>
    </div>
  );
}
