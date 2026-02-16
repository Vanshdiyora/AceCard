import { useEffect, useState } from "react";
import { normalizeProfile } from "../../../../publicProfile/utils/normalizeProfile";
import { useAppDispatch, useAppSelector } from "../../../../../app/hooks";
import VicePublicSetting from "../VicePublicSetting";
import { loadMyProfile } from "../../../../publicProfile/slice";
import MobileWebsite from "../../../../publicProfile/components/MobileWebsite";
import { denormalizeProfile } from "../../../../publicProfile/utils/normalizeProfile";

export default function VicePublicPage() {
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
    <div className="pt-6 px-6 grid grid-cols-1 gap-6 h-[calc(100vh-64px)] transition-[grid-template-columns] duration-500 ease-in-out  lg:grid-cols-[640px_1fr] overflow-hidden">

      {/* RIGHT — Fixed Preview */}
      <div className="origin-top scale-[0.6] xl:scale-[0.7] flex items-center justify-center">

        <div className="w-[390px] h-[780px]
                rounded-[44px]
                bg-white
                p-[10px]">
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
      <div className="h-[75%] rounded-2xl overflow-hidden overflow-y-auto overscroll-contain transition-all duration-500 ease-in-out order-2 lg:order-1 bg-white shadow">

        <VicePublicSetting
          key={username}
          username={username}
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
