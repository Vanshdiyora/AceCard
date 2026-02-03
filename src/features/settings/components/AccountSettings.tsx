import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import {
  fetchAccountProfile,
  fetchTrackingPixels,
  saveTrackingPixels,
} from "../slice";
import BrandLoader from "../../../common/ui/BrandLoader";
import ResetPasswordSection from "./ResetPasswordSection";
import EditAccountModal from "./EditAccountModal";

/* ---------- validators ---------- */
const isMetaPixel = (v: string) => /^[0-9]{10,20}$/.test(v);
const isGA = (v: string) => /^G-[A-Z0-9]{8,12}$/.test(v);
const isLinkedIn = (v: string) => /^[0-9]{5,10}$/.test(v);

export default function AccountSettings() {
  const dispatch = useAppDispatch();

  const { data, loading } = useAppSelector((s) => s.settings.account);
  const tracking = useAppSelector((s) => s.settings.trackingPixels);

  const [editOpen, setEditOpen] = useState(false);

  const [meta, setMeta] = useState("");
  const [ga, setGa] = useState("");
  const [li, setLi] = useState("");

  const [showSuccess, setShowSuccess] =
    useState<null | "meta" | "ga" | "li">(null);

  useEffect(() => {
    dispatch(fetchAccountProfile());
  }, [dispatch]);

  const isVendor = data?.role === "vendor_admin";

  useEffect(() => {
    if (data?.role === "vendor_admin") {
      dispatch(fetchTrackingPixels());
    }
  }, [dispatch, data?.role]);


  useEffect(() => {
    if (tracking.data) {
      setMeta(tracking.data.meta_pixel_id || "");
      setGa(tracking.data.google_analytics_id || "");
      setLi(tracking.data.linkedin_insight_tag_id || "");
    }
  }, [tracking.data]);

  const saveMeta = async () => {
    if (!isMetaPixel(meta)) return;

    await dispatch(
      saveTrackingPixels({
        meta_pixel_id: meta,
        google_analytics_id: ga,
        linkedin_insight_tag_id: li,
      })
    ).unwrap();

    dispatch(fetchTrackingPixels()); // 👈 refresh from API
    setShowSuccess("meta");
  };


  const saveGA = async () => {
    if (!isGA(ga)) return;

    await dispatch(
      saveTrackingPixels({
        meta_pixel_id: meta,
        google_analytics_id: ga,
        linkedin_insight_tag_id: li,
      })
    ).unwrap();

    dispatch(fetchTrackingPixels());
    setShowSuccess("ga");
  };


  const saveLI = async () => {
    if (!isLinkedIn(li)) return;

    await dispatch(
      saveTrackingPixels({
        meta_pixel_id: meta,
        google_analytics_id: ga,
        linkedin_insight_tag_id: li,
      })
    ).unwrap();

    dispatch(fetchTrackingPixels());
    setShowSuccess("li");
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <BrandLoader />
      </div>
    );

  if (!data) return null;

  return (
    <div className="bg-white shadow p-8 rounded-xl">
      <h2 className="text-xl font-semibold mb-6">Account Settings</h2>

      <div className="space-y-2 mb-8">
        {renderView("Name", data.name)}
        {renderView("Email", data.email)}
        {renderView("Phone", data.phone)}
   {renderView("Role", data.custom_job_role || data.role)}

        {renderView("Company Description", data.company_description)}
        {renderView("Address", data.address)}

        <button
          onClick={() => setEditOpen(true)}
          className="mt-6 px-6 py-2 bg-purple-600 text-white rounded-lg"
        >
          Edit
        </button>
      </div>

      {isVendor && (
        <div className="border-t rounded-xl py-6 mb-8">
          <h3 className="font-semibold mb-4">Tracking Pixels</h3>

          {tracking.loading && (
            <p className="text-sm text-gray-500 mb-3">
              Loading tracking pixels…
            </p>
          )}

          {/* META */}
          <div className="grid grid-cols-[1fr_auto] gap-3 mb-4">
            <div>
              <label className="text-sm font-medium">Meta Pixel ID</label>
              <input
                value={meta}
                onChange={(e) => setMeta(e.target.value.trim())}
                placeholder="1234567890123"
                className={`w-full mt-1 px-3 py-2 border rounded-lg outline-none ${meta === "" || isMetaPixel(meta)
                    ? "border-gray-300"
                    : "border-red-500"
                  }`}
              />
              {meta !== "" && !isMetaPixel(meta) && (
                <p className="text-xs text-red-500 mt-1">
                  Enter a valid Meta Pixel ID
                </p>
              )}
            </div>
            <div className="flex items-center mt-[26px]">
              <button
                disabled={!isMetaPixel(meta) || tracking.saving}
                onClick={saveMeta}
                className={`h-10 px-5 rounded-lg text-white ${isMetaPixel(meta) && !tracking.saving
                    ? "bg-purple-600"
                    : "bg-gray-300"
                  }`}
              >
                Save
              </button>
            </div>
          </div>

          {/* GA */}
          <div className="grid grid-cols-[1fr_auto] gap-3 mb-4">
            <div>
              <label className="text-sm font-medium">
                Google Analytics Measurement ID
              </label>
              <input
                value={ga}
                onChange={(e) => setGa(e.target.value.trim())}
                placeholder="G-XXXXXXXXXX"
                className={`w-full mt-1 px-3 py-2 border rounded-lg outline-none ${ga === "" || isGA(ga)
                    ? "border-gray-300"
                    : "border-red-500"
                  }`}
              />
              {ga !== "" && !isGA(ga) && (
                <p className="text-xs text-red-500 mt-1">
                  Format: G-XXXXXXXXXX
                </p>
              )}
            </div>
            <div className="flex items-center mt-[26px]">
              <button
                disabled={!isGA(ga) || tracking.saving}
                onClick={saveGA}
                className={`h-10 px-5 rounded-lg text-white ${isGA(ga) && !tracking.saving
                    ? "bg-purple-600"
                    : "bg-gray-300"
                  }`}
              >
                Save
              </button>
            </div>
          </div>

          {/* LINKEDIN */}
          <div className="grid grid-cols-[1fr_auto] gap-3">
            <div>
              <label className="text-sm font-medium">
                LinkedIn Insight Tag ID
              </label>
              <input
                value={li}
                onChange={(e) => setLi(e.target.value.trim())}
                placeholder="123456"
                className={`w-full mt-1 px-3 py-2 border rounded-lg outline-none ${li === "" || isLinkedIn(li)
                    ? "border-gray-300"
                    : "border-red-500"
                  }`}
              />
              {li !== "" && !isLinkedIn(li) && (
                <p className="text-xs text-red-500 mt-1">
                  Enter valid LinkedIn Tag ID
                </p>
              )}
            </div>
            <div className="flex items-center mt-[26px]">
              <button
                disabled={!isLinkedIn(li) || tracking.saving}
                onClick={saveLI}
                className={`h-10 px-5 rounded-lg text-white ${isLinkedIn(li) && !tracking.saving
                    ? "bg-purple-600"
                    : "bg-gray-300"
                  }`}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      <ResetPasswordSection />
      <EditAccountModal open={editOpen} onClose={() => setEditOpen(false)} />

      {showSuccess && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-[320px] text-center shadow-xl">
            <h3 className="text-lg font-semibold mb-2">Saved!</h3>
            <p className="text-gray-600 mb-4">
              {showSuccess === "meta" && "Meta Pixel saved successfully."}
              {showSuccess === "ga" && "Google Analytics saved successfully."}
              {showSuccess === "li" && "LinkedIn Insight Tag saved successfully."}
            </p>
            <button
              onClick={() => setShowSuccess(null)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function renderView(label: string, value: string) {
  return (
    <p>
      <strong>{label}:</strong>{" "}
      {value || <span className="text-gray-400">—</span>}
    </p>
  );
}
