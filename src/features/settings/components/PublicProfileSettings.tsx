import { useEffect,useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import TeamMemberPublicProfileTab from "../../teams/components/details/publicProfile/TeamMemberPublicProfileTab";
import { loadPublicProfile } from "../../publicProfile/slice";
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
      dispatch(loadPublicProfile({ handle: username }));
    }
  }, [username, dispatch]);

  // 👇 when API loads, seed live preview
  useEffect(() => {
    if (data) setLiveConfig(data);
  }, [data]);

  return (
    <div className="flex gap-6 h-[calc(100vh-180px)]">
      {/* LEFT — Scrollable Editor */}
      <div className="flex-1 min-w-[480px] overflow-y-auto pr-2">
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

      {/* RIGHT — Fixed Preview */}
      <div className="w-[360px] shrink-0">
        <div className="rounded-3xl border shadow-lg bg-white overflow-hidden h-full">
          {loading || !liveConfig ? (
            <div className="p-6 text-center text-gray-500">
              Loading preview…
            </div>
          ) : (
            <div className="h-full overflow-y-auto">
              <MobileWebsite data={liveConfig} /> {/* 👈 LIVE */}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
