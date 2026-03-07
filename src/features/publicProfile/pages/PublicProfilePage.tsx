import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { loadPublicProfile } from "../slice";
import MobileWebsite from "../components/MobileWebsite";
import BrandLoader from "../../../common/ui/BrandLoader";

type Props = {
  handle?: string;
};

export default function PublicProfilePage({ handle: propHandle }: Props) {
  const { handle: routeHandle, username } = useParams<{
    handle: string;
    username: string;
  }>();

  const handle = propHandle || routeHandle || username;
  const dispatch = useAppDispatch();
  const { data, loading } = useAppSelector((s) => s.publicProfile);

  /* -------- Load Profile -------- */
  useEffect(() => {
    if (!handle) return;

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          dispatch(
            loadPublicProfile({
              handle,
              type: "direct",
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
            })
          );
        },
        () => {
          dispatch(loadPublicProfile({ handle, type: "direct" }));
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      dispatch(loadPublicProfile({ handle, type: "direct" }));
    }
  }, [handle, dispatch]);

  if (!handle)
    return <div className="p-6">No profile handle found.</div>;

  if (loading || !data)
    return (
      <div className="h-screen flex items-center justify-center bg-[#f6f7fb]">
        <BrandLoader />
      </div>
    );

  return (
    <div className="min-h-screen bg-[#f6f7fb] flex items-center justify-center">

      {/* 📱 MOBILE — Full Screen (No Phone Frame) */}
      <div className="w-full h-full md:hidden bg-white">
        <MobileWebsite data={data} isPreview={false} />
      </div>

      {/* 💻 DESKTOP — Phone Preview */}
      <div className="hidden sm:flex w-full justify-center items-center min-h-screen bg-[#f6f7fb]">

        {/* Phone wrapper = full viewport height */}
        <div className="h-screen aspect-[10/19] max-w-[420px]">

          <div
            className="
        w-full h-full
        bg-white
        shadow-xl
        ring-1 ring-gray-200
        overflow-hidden
      "
          >
            <div className="h-full overflow-y-auto no-scrollbar">
              <MobileWebsite data={data} isPreview={true} />
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}