import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import TeamMemberPublicProfileTab from "../../teams/components/details/publicProfile/TeamMemberPublicProfileTab";
import { loadPublicProfile } from "../../publicProfile/slice";

export default function PublicProfileSettings() {
  const dispatch = useAppDispatch();

  const username = useAppSelector(
    (state) => state.settings.account.data?.username
  );

  useEffect(() => {
    if (username) {
      dispatch(loadPublicProfile({ handle: username }));
    }
  }, [username, dispatch]);

  return <TeamMemberPublicProfileTab key={username} />;
}
