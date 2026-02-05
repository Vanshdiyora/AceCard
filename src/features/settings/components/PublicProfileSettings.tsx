import { useEffect, useState } from "react";
import { normalizeProfile } from "../../publicProfile/utils/normalizeProfile";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import TeamMemberPublicProfileTab from "../../teams/components/details/publicProfile/TeamMemberPublicProfileTab";
import { loadMyProfile } from "../../publicProfile/slice";
import MobileWebsite from "../../publicProfile/components/MobileWebsite";
import { denormalizeProfile } from "../../publicProfile/utils/normalizeProfile";

export default function PublicProfileSettings() {
  const dispatch = useAppDispatch();
  const username = useAppSelector(
    (state) => state.settings.account.data?.username
  );

  const { data, loading } = useAppSelector((s) => s.publicProfile);

  // 👇 LOCAL live preview state
  const [liveConfig, setLiveConfig] = useState<any | null>(null);

  useEffect(() => {
    if (username) {
      dispatch(loadMyProfile());
    }
  }, [username, dispatch]);

  // 👇 when API loads, seed live preview

  useEffect(() => {
    if (!data) return;

    const normalized = normalizeProfile(data);
    setLiveConfig(denormalizeProfile(normalized, data));
  }, [data]);

  return (
    <div className="flex gap-6 h-[calc(100vh-120px)] overflow-hidden">

      {/* RIGHT — Fixed Preview */}
      <div className="hidden lg:flex justify-center items-start h-full overflow-hidden">

        <div className="w-[330px] max-h-full aspect-[9/19.5] bg-black rounded-[2.5rem] p-2">
          <div className="h-full bg-white rounded-[2rem] overflow-hidden flex flex-col">
            {loading || !liveConfig ? (
              <div className="h-full flex items-center justify-center text-gray-400">
                Loading preview…
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto overscroll-contain no-scrollbar">
                <MobileWebsite data={liveConfig} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* LEFT — Scrollable Editor */}
      <div className="flex-1 min-w-[480px] h-full overflow-y-auto overscroll-contain pr-2">

        <TeamMemberPublicProfileTab
          key={username}
          useSelfApi={true}
          showLockable={true}
          onLiveChange={(cfg) => {
            if (!data) return;
            setLiveConfig(denormalizeProfile(cfg, data));
          }}   // 🔥 connect
        />
      </div>
    </div>
  );
}
