import { useRef, useState, useEffect } from "react";
import { uploadImage } from "../../../../publicProfile/services/publicProfile.api";
import CoverCropModal from "../../../../../common/ui/CoverCropModal";
import { resolveTheme } from "../MobilePublicSettings";
import { Pencil } from "lucide-react";
import { EditModal } from "../MobilePublicSettings";

export function Banner({
  image,
  ctaText,
  ctaUrl,
  theme,
  onBannerChange,
  editable = false,
  autoOpen = false,
}: any) {
  const t = resolveTheme(theme);

  const fileRef = useRef<File | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [isCropping, setIsCropping] = useState(false);

  const [draftImage, setDraftImage] = useState<string | null>(null);
  const [draft, setDraft] = useState<{
    cta_text: string;
    cta_url: string;
  } | null>(null);

  /* ---------------- AUTO OPEN ---------------- */
  useEffect(() => {
    if (autoOpen) {
      setIsEditing(true);
    }
  }, [autoOpen]);

  /* ---------------- INIT DRAFT ON OPEN ---------------- */
  useEffect(() => {
    if (!isEditing) return;

    setDraft({
      cta_text: ctaText || "",
      cta_url: ctaUrl || "",
    });

    setDraftImage(image); // initialize preview with committed image
  }, [isEditing, ctaText, ctaUrl, image]);

  /* ---------------- IMAGE UPLOAD ---------------- */
  const uploadBanner = async (blob: Blob) => {
    const file = new File([blob], "banner.jpg", { type: "image/jpeg" });
    const res = await uploadImage(file);

    setDraftImage(res.data.url); // only update preview
    setIsCropping(false);
  };

  /* ---------------- SAVE ---------------- */
  const saveBanner = () => {
    if (!draft) return;

    onBannerChange((prev: any) => ({
      ...prev,
      banner: {
        ...prev.banner,
        image_url: draftImage, // commit image
        cta_text: draft.cta_text,
        cta_url: draft.cta_url,
      },
    }));

    setIsEditing(false);
    setDraft(null);
  };

  return (
    <div className="relative">
      {/* CTA TEXT */}
      {ctaText && (
        <p
          className="text-sm font-semibold pb-2"
          style={{ color: t.text }}
        >
          {ctaText}
        </p>
      )}

      {/* EDIT BUTTON */}
      {editable && (
        <button
          onClick={() => setIsEditing(true)}
          className="absolute top-2 right-0 z-20 h-9 w-9 rounded-full shadow
                     flex items-center justify-center transition hover:scale-105
                     bg-orange-500 text-white"
        >
          <Pencil size={16} />
        </button>
      )}

      {/* OUTSIDE BANNER (ONLY COMMITTED IMAGE) */}
      <div
        className="cursor-pointer"
        onClick={() => ctaUrl && window.open(ctaUrl, "_blank")}
      >
        <img
          src={image}
          className="w-full h-28 rounded-2xl object-cover"
          alt="Banner"
        />
      </div>

      {/* ---------------- EDIT MODAL ---------------- */}
      <EditModal
        open={isEditing}
        onClose={() => {
          setIsEditing(false); // discard draft automatically
        }}
        onSave={saveBanner}
      >
        <h3 className="text-lg font-semibold">
          Edit Banner
        </h3>

        {draft && (
          <div className="space-y-4">

            {/* PREVIEW IMAGE INSIDE MODAL */}
            <div className="w-full h-32 rounded-2xl overflow-hidden bg-gray-100">
              <img
                src={draftImage || image}
                alt="Banner Preview"
                className="w-full h-full object-cover"
              />
            </div>

            {/* CHANGE IMAGE BUTTON */}
            <button
              onClick={() =>
                document.getElementById("bannerInput")?.click()
              }
              className="w-full bg-gray-100 rounded-xl p-2 text-sm"
            >
              Change Image
            </button>

            <input
              id="bannerInput"
              type="file"
              hidden
              accept="image/*"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  fileRef.current = e.target.files[0];
                  setIsCropping(true);
                }
              }}
            />

            {/* CTA TEXT */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                CTA Text
              </label>
              <input
                className="w-full border rounded-lg p-2 text-sm"
                placeholder="e.g. Shop Now"
                value={draft.cta_text}
                onChange={(e) =>
                  setDraft((d) =>
                    d ? { ...d, cta_text: e.target.value } : d
                  )
                }
              />
            </div>

            {/* CTA LINK */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                CTA Link
              </label>
              <input
                className="w-full border rounded-lg p-2 text-sm"
                placeholder="https://your-link.com"
                value={draft.cta_url}
                onChange={(e) =>
                  setDraft((d) =>
                    d ? { ...d, cta_url: e.target.value } : d
                  )
                }
              />
            </div>
          </div>
        )}
      </EditModal>

      {/* ---------------- CROP MODAL ---------------- */}
      {isCropping && fileRef.current && (
        <CoverCropModal
          file={fileRef.current}
          onCancel={() => setIsCropping(false)}
          onSave={uploadBanner}
        />
      )}
    </div>
  );
}