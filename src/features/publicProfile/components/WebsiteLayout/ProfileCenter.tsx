import { ProfileActions } from "./ProfileActions";
import { formatRole } from "../MobileWebsite";

export function ProfileCenter({
  profile,
  theme,
  user,
  layout,
  onConnect,
}: any) {
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
        style={{ color: theme.text_color }}
      >
        {/* Avatar */}
        <div className={`w-full flex ${avatarAlign}`}>
          <img
            src={profile.avatar_url || ""}
            className="w-20 h-20 rounded-full object-cover shadow-md"
          />
        </div>

        {/* Name */}
        <h2 className="mt-3 text-base font-semibold">
          {user?.name}
        </h2>

        {/* Role */}
        <p className="text-xs mt-1" style={{ color: theme.accent_color }}>
          {formatRole(user?.job_title || user?.role)}
        </p>

        {/* Actions */}
        <div className="mt-5 w-full">
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
