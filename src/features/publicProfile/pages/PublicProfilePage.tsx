import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { loadPublicProfile } from "../slice";
import MobileWebsite from "../components/MobileWebsite";

type Props = {
  handle?: string;
};

export default function PublicProfilePage({ handle: propHandle }: Props) {
  const { handle: routeHandle } = useParams<{ handle: string }>();
  const { username } = useParams();

  const handle = propHandle || routeHandle || username;
  const dispatch = useAppDispatch();
  const { data, loading } = useAppSelector((s) => s.publicProfile);

  useEffect(() => {
    if (handle) {
      dispatch(loadPublicProfile({ handle }));
    }
  }, [handle, dispatch]);

  // 🔒 lock body scroll when page is mounted
  useEffect(() => {
    document.body.classList.add("body-locked");
    return () => {
      document.body.classList.remove("body-locked");
    };
  }, []);

  if (!handle) return <div className="p-6">No profile handle found.</div>;
  if (loading || !data) return <div className="p-6">Loading...</div>;

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#f6f7fb]">
      <div
        className="bg-black rounded-[2.5rem] p-2 shadow-2xl"
        style={{ width: 360, height: 350 }}
      >

        <div className="h-full bg-white rounded-[2rem] overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto no-scrollbar overscroll-contain">
            <MobileWebsite data={data} />
          </div>
        </div>
      </div>
    </div>

  );
}
