import { useRef, useState, useEffect } from "react";
import { uploadImage } from "../../../../publicProfile/services/publicProfile.api";
import CoverCropModal from "../../../../../common/ui/CoverCropModal";
import { resolveTheme, EditModal } from "../MobilePublicSettings";
import { Pencil } from "lucide-react";

type Props = {
  image?: string;
  ctaText?: string;
  ctaUrl?: string;
  theme: any;
  onBannerChange: (updater: any) => void;
  editable?: boolean;
  autoOpen?: boolean;
};

export function Banner({
  image,
  ctaText,
  ctaUrl,
  theme,
  onBannerChange,
  editable = false,
  autoOpen = false,
}: Props) {
  const t = resolveTheme(theme);

  const fileRef = useRef<File | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [isCropping, setIsCropping] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [draftImage, setDraftImage] = useState<string | null>(null);
  const [draft, setDraft] = useState<{
    cta_text: string;
    cta_url: string;
  } | null>(null);

  /* ---------------- URL VALIDATION ---------------- */
  const isValidUrl = (url: string) => {
    if (!url || !url.trim()) return false;
    try {
      const parsed = new URL(url.trim());
      return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
      return false;
    }
  };

  /* ---------------- AUTO OPEN ---------------- */
  useEffect(() => {
    if (autoOpen) setIsEditing(true);
  }, [autoOpen]);

  /* ---------------- INIT DRAFT ---------------- */
  useEffect(() => {
    if (!isEditing) return;

    setDraft({
      cta_text: ctaText || "",
      cta_url: ctaUrl || "",
    });

    setDraftImage(image ?? null);
    setError(null);
  }, [isEditing, ctaText, ctaUrl, image]);

  /* ---------------- IMAGE UPLOAD ---------------- */
  const uploadBanner = async (blob: Blob) => {
    const file = new File([blob], "banner.jpg", { type: "image/jpeg" });
    const res = await uploadImage(file);

    setDraftImage(res.data.url);
    setIsCropping(false);
  };

  /* ---------------- SAVE ---------------- */
  const saveBanner = () => {
    if (!draft) return;

    if (draft.cta_url?.trim()) {
      if (!isValidUrl(draft.cta_url)) {
        setError(
          "CTA link is invalid. Make sure it starts with https:// or http:// "
        );
        return;
      }
    }

    setError(null);

    onBannerChange((prev: any) => ({
      ...prev,
      banner: {
        ...prev.banner,
        image_url: draftImage,
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
        <p className="text-sm font-semibold pb-2" style={{ color: t.text }}>
          {ctaText}
        </p>
      )}

      {/* EDIT BUTTON */}
      {editable && (
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          className="absolute top-2 right-0 z-20 h-9 w-9 rounded-full shadow
                     flex items-center justify-center transition hover:scale-105
                     bg-orange-500 text-white"
        >
          <Pencil size={16} />
        </button>
      )}

      {/* BANNER DISPLAY */}
      <div
        className="cursor-pointer"
        onClick={() => {
          if (ctaUrl && isValidUrl(ctaUrl)) {
            window.open(ctaUrl, "_blank");
          }
        }}
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
        errorMessage={error}
        onClose={() => {
          setIsEditing(false);
          setDraft(null);
          setError(null);
        }}
        onSave={saveBanner}
      >
        <h3 className="text-lg font-semibold">Edit Banner</h3>

        {draft && (
          <div className="space-y-4">
            {/* IMAGE PREVIEW */}
            <div className="w-full h-32 rounded-2xl overflow-hidden bg-gray-100">
              <img
                src={draftImage || image}
                alt="Banner Preview"
                className="w-full h-full object-cover"
              />
            </div>

            {/* CHANGE IMAGE */}
            <button
              type="button"
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
                className={`w-full border rounded-lg p-2 text-sm ${error ? "border-red-400 focus:ring-red-400" : ""
                  }`}
                placeholder="https://your-link.com"
                value={draft.cta_url}
                onChange={(e) => {
                  setError(null);
                  setDraft((d) =>
                    d ? { ...d, cta_url: e.target.value } : d
                  );
                }}
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