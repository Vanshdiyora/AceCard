import { useState } from "react";
import { Pencil } from "lucide-react";

import { ProfileCenter } from "./ProfileCenter";
import { ProfileClassic } from "./ProfileClassic";
import { ProfileSplit } from "./ProfileSplit";

export function ProfileWrapper({
  profile,
  cover,
  theme,
  user,
  layout,
  onConnect,
  onEdit,
  onProfileChange,
}: any) {
  const [, setIsEditing] = useState(false);

  const isLocked = layout?.locked === true;

  const renderProfile = () => {
    switch (layout?.profile_type) {
      case 1:
        return (
          <ProfileSplit
            profile={profile}
            cover={cover}
            theme={theme}
            user={user}
            layout={layout}
            onConnect={onConnect}
            onProfileChange={onProfileChange}
          />
        );

      case 2:
        return (
          <ProfileCenter
            profile={profile}
            cover={cover}
            theme={theme}
            user={user}
            layout={layout}
            onProfileChange={onProfileChange}
          />
        );

      default:
        return (
          <ProfileClassic
            profile={profile}
            cover={cover}
            theme={theme}
            user={user}
            layout={layout}
            onProfileChange={onProfileChange}
          />
        );
    }
  };

  return (
    <div className="relative">
      {/* EDIT BUTTON – only if NOT locked */}
      {!isLocked && (
        <button
          type="button"
          onClick={() => {
            setIsEditing((v) => !v);
            onEdit?.();
          }}
          className="absolute top-2 right-2 z-30 h-9 w-9 rounded-full shadow
            flex items-center justify-center transition hover:scale-105
            bg-orange-500 text-white"
          title="Edit"
        >
          <Pencil size={16} />
        </button>
      )}

      {renderProfile()}
    </div>
  );
}
