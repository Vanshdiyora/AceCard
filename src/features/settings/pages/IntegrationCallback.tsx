import { useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useAppDispatch } from "../../../app/hooks";
import { connectIntegration } from "../../settings/slice";

export default function IntegrationCallback() {
  const { provider } = useParams<{ provider: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const code = params.get("code");

    if (!provider || !code) {
      navigate("/admin/settings");
      return;
    }

    dispatch(connectIntegration({ provider, payload: { code } }))
      .unwrap()
      .then(() => navigate("/admin/settings"))
      .catch(() => navigate("/admin/settings"));
  }, [provider, location.search, dispatch, navigate]);

  return (
    <div className="p-8 text-center text-gray-500">
      Connecting {provider}...
    </div>
  );
}
