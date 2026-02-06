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
}: any) {
  const t = resolveTheme(theme);

  const fileRef = useRef<File | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [isCropping, setIsCropping] = useState(false);

  // 🔥 local draft
  const [draft, setDraft] = useState<{
    cta_text: string;
    cta_url: string;
  } | null>(null);

  /* ---------- INIT DRAFT ONLY ON OPEN ---------- */
  useEffect(() => {
    if (!isEditing) return;

    setDraft({
      cta_text: ctaText || "",
      cta_url: ctaUrl || "",
    });
  }, [isEditing, ctaText, ctaUrl]);

  /* ---------- IMAGE UPLOAD ---------- */
  const uploadBanner = async (blob: Blob) => {
    const file = new File([blob], "banner.jpg", { type: "image/jpeg" });
    const res = await uploadImage(file);

    onBannerChange((prev: any) => ({
      ...prev,
      banner: {
        ...prev.banner,
        image_url: res.data.url,
      },
    }));

    setIsCropping(false);
  };

  /* ---------- SAVE ---------- */
  const saveBanner = () => {
    if (!draft) return;

    onBannerChange((prev: any) => ({
      ...prev,
      banner: {
        ...prev.banner,
        cta_text: draft.cta_text,
        cta_url: draft.cta_url,
      },
    }));

    setIsEditing(false);
    setDraft(null);
  };

  return (
    <div className="relative">
      {ctaText && (
        <p
          className="text-sm font-semibold pb-2"
          style={{ color: t.text }}
        >
          {ctaText}
        </p>
      )}

      {/* ✏️ EDIT ICON */}
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

      {/* BANNER IMAGE */}
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

      {/* ---------- EDIT MODAL ---------- */}
      <EditModal
        open={isEditing}
        onClose={() => setIsEditing(false)}   // ❌ discard
        onSave={saveBanner}                   // ✅ commit
      >
        <h3 className="text-lg font-semibold">
          Edit Banner
        </h3>

        {draft && (
          <div className="space-y-4">
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

      {/* ---------- CROP ---------- */}
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
