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
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          })
        );
      },
      () => {
        // fallback if user blocks location
        dispatch(loadPublicProfile({ handle }));
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  } else {
    dispatch(loadPublicProfile({ handle }));
  }
}, [handle, dispatch]);


  /* -------- Desktop Only Scroll Lock -------- */
  useEffect(() => {
    if (window.innerWidth >= 640) {
      document.body.classList.add("body-locked");
      return () => document.body.classList.remove("body-locked");
    }
  }, []);

  if (!handle) return <div className="p-6">No profile handle found.</div>;
  if (loading || !data) return <div className="p-6 mt-64"> <BrandLoader /> </div>;

  return (
    <div className="min-h-screen sm:min-h-[100svh] w-full bg-[#f6f7fb] flex items-center justify-center">
      {/* Phone shell only on desktop */}
      <div className="w-full min-h-screen sm:max-w-[380px] sm:h-[720px] bg-black sm:rounded-[2.5rem] sm:p-2 shadow-2xl">
        <div
          id="phone-frame"
          className="w-full h-full bg-white sm:rounded-[2rem] overflow-hidden flex flex-col relative"
        >
          <div className="flex-1 relative overflow-hidden">
            {/* Desktop inner scroll, mobile normal flow */}
            <div
              id="phone-scroll"
              className="sm:absolute sm:inset-0 sm:overflow-y-auto no-scrollbar"
            >
              <MobileWebsite data={data} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
