import { useEffect, useState } from "react";
import { normalizeProfile } from "../../../../publicProfile/utils/normalizeProfile";
import { useAppDispatch, useAppSelector } from "../../../../../app/hooks";
import VicePublicSetting from "../VicePublicSetting";
import { loadMyProfile } from "../../../../publicProfile/slice";
import MobileWebsite from "../../../../publicProfile/components/MobileWebsite";
import { denormalizeProfile } from "../../../../publicProfile/utils/normalizeProfile";
import BrandLoader from "../../../../../common/ui/BrandLoader";

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
    <div className="pt-6 px-4 xl:px-8 xl:h-[calc(100vh-84px)]">


      <div className="w-full h-full flex flex-col xl:flex-row gap-8">

        {/* LEFT — Phone Preview */}
        <div className="flex justify-center xl:flex-1 order-1 xl:order-1">
          <div className="flex flex-col items-center">

            <a
              href={`/profile/${username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-gray-400 bg-gray-50
    tracking-wide
    border border-[#D5D5D5]
    rounded-xl
    px-4
    py-1
    mb-2
    shadow-md
    hover:shadow-lg
    transition-shadow
    duration-200
    inline-block
  "
            >
              Live Preview
            </a>



            {/* Phone Wrapper */}
            <div className="w-full max-w-[400px] aspect-[10/19] xl:h-[85vh] xl:max-h-[650px] scale-90">


              <div className="
  w-min-[200px] w-full h-full
  bg-white
  rounded-[20px]
  shadow-xl
  ring-1 ring-gray-200
  overflow-hidden
">

                {loading || !liveConfig ? (
                  <div className="h-full flex items-center justify-center p-4">
                    <BrandLoader />
                  </div>
                ) : (
                  <MobileWebsite data={liveConfig} isPreview={true} />
                )}
              </div>

            </div>

          </div>

        </div>


        {/* RIGHT — Editor Panel */}
        <div className="w-full xl:w-[480px] xl:ml-auto bg-white rounded-2xl shadow-md h-full overflow-y-auto order-2 xl:order-2">
          <VicePublicSetting
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
    </div>
  );

}
