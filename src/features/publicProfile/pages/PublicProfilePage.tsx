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
    if (handle) dispatch(loadPublicProfile(handle));
  }, [handle, dispatch]);

  if (!handle) return <div className="p-6">No profile handle found.</div>;
  if (loading || !data) return <div className="p-6">Loading...</div>;

  return <MobileWebsite data={data} />;
}
