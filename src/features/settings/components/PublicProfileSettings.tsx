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

  // Live preview state
  const [liveConfig, setLiveConfig] = useState<any | null>(null);

  useEffect(() => {
    if (username) {
      dispatch(loadMyProfile());
    }
  }, [username, dispatch]);

  // Seed preview when API loads
  useEffect(() => {
    if (!data) return;

    const normalized = normalizeProfile(data);
    setLiveConfig(denormalizeProfile(normalized, data));
  }, [data]);

  return (
    <div
      className="
        pt-6 px-6
        grid grid-cols-1 lg:grid-cols-[720px_1fr]
        gap-6
        min-h-[calc(100vh-64px)]
      "
    >

      {/* left — Mobile Preview */}
      <div
        className="
          hidden lg:flex
          h-full
          justify-center
          items-start
          pt-6
        "
      >
        <div className="origin-top scale-[0.6] xl:scale-[0.7]">
          <div
            className="
              w-[390px]
              h-[780px]
              rounded-[44px]
              bg-white
              p-[10px]
            "
          >
            <div
              className="
                relative
                h-full
                bg-white
                rounded-[2rem]
                overflow-hidden
                flex flex-col
              "
            >

              {loading || !liveConfig ? (
                <div className="h-full flex items-center justify-center text-gray-400">
                  Loading preview…
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto overscroll-contain no-scrollbar">
                  <MobileWebsite data={liveConfig} isPreview={true} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* right — Editor Panel */}
      <div
        className="
          h-full
          rounded-2xl
          overflow-y-auto
          overscroll-contain
          bg-white
          shadow
        "
      >
        <TeamMemberPublicProfileTab
          key={username}
          username={username}
          useSelfApi={true}
          showLockable={true}
          onLiveChange={(cfg) => {
            if (!data) return;
            setLiveConfig(denormalizeProfile(cfg, data));
          }}
        />
      </div>


    </div>
  );
}
