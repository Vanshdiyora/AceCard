import { ProfileCenter } from "./ProfileCenter";
import { ProfileClassic } from "./ProfileClassic";
import { ProfileSplit } from "./ProfileSplit";

export function ProfileWrapper({ profile, cover, theme, user, onConnect, layout }: any) {
  switch (layout?.profile_type) {
    case 1:
      return (
        <ProfileSplit
          profile={profile}
          theme={theme}
          user={user}
          layout={layout}   // 👈 add this
          onConnect={onConnect}
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
          onConnect={onConnect}
        />
      );

    default:
      return (
        <ProfileClassic
          profile={profile}
          cover={cover}
          theme={theme}
          user={user}
          layout={layout}   // 👈 add this
          onConnect={onConnect}
        />

      );
  }
}
