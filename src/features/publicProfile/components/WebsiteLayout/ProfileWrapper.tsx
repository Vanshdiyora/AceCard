import { ProfileCenter } from "./ProfileCenter";
import { ProfileClassic } from "./ProfileClassic";
import { ProfileSplit } from "./ProfileSplit";
import { Pencil, Check } from "lucide-react";
import { useState } from "react";

export function ProfileWrapper({
  profile,
  cover,
  theme,
  user,
  onConnect,
  layout,
  onEdit,
  onProfileChange,
}: any) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="relative">
      {/* ROUND EDIT ICON */}
      <button
        onClick={() => {
          setIsEditing((v) => !v);
          onEdit?.();
        }}
        className={`absolute top-2 right-2 z-30 h-9 w-9 rounded-full shadow
          flex items-center justify-center transition hover:scale-105
          ${isEditing ? "bg-green-500 text-white" : "bg-orange-500 text-white"}`}
        title={isEditing ? "Save" : "Edit"}
      >
        {isEditing ? <Check size={16} /> : <Pencil size={16} />}
      </button>

      {(() => {
        switch (layout?.profile_type) {
          case 1:
            return (
              <ProfileSplit
                profile={profile}
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
      })()}
    </div>
  );
}
