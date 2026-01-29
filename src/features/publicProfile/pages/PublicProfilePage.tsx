import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { loadPublicProfile } from "../slice";
import MobileWebsite from "../components/MobileWebsite";

export default function PublicProfilePage() {
  const { handle } = useParams<{ handle: string }>();
  const dispatch = useAppDispatch();
  const { data, loading } = useAppSelector((s) => s.publicProfile);

  useEffect(() => {
    if (handle) dispatch(loadPublicProfile(handle));
  }, [handle]);

  if (loading || !data) return <div className="p-6">Loading...</div>;

  return <MobileWebsite data={data} />;
}
