import { useRef, useState, useEffect } from "react";
import { uploadImage } from "../../../../publicProfile/services/publicProfile.api";
import CoverCropModal from "../../../../../common/ui/CoverCropModal";
import { resolveTheme } from "../MobilePublicSettings";
import { Pencil } from "lucide-react";

export function Banner({
    image,
    ctaText,
    ctaUrl,
    theme,
    onBannerChange,
    editable = false
}: any) {
    const t = resolveTheme(theme);

    const [isCropping, setIsCropping] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [draftText, setDraftText] = useState("");
    const [draftUrl, setDraftUrl] = useState("");

    const fileRef = useRef<File | null>(null);

    // 🔁 keep modal form in sync with parent
    useEffect(() => {
        setDraftText(ctaText || "");
        setDraftUrl(ctaUrl || "");
    }, [ctaText, ctaUrl]);


    const uploadBanner = async (blob: Blob) => {
        const file = new File([blob], "banner.jpg", { type: "image/jpeg" });
        const res = await uploadImage(file);
        const url = res.data.url;

        onBannerChange((prev: any) => ({
            ...prev,
            banner: {
                ...prev.banner,
                image_url: url,
            },
        }));

        setIsCropping(false);
    };


    const saveText = () => {
        onBannerChange((prev: any) => ({
            ...prev,
            banner: {
                ...prev.banner,
                cta_text: draftText,
                cta_url: draftUrl,
            },
        }));

        setIsEditing(false);
    };

    // 🔒 lock background scroll when banner modal/crop is open
    useEffect(() => {
        const open = isEditing || isCropping;

        if (!open) {
            document.body.style.overflow = "";
            document.body.style.position = "";
            document.body.style.top = "";
            document.body.style.left = "";
            document.body.style.right = "";
            document.body.style.width = "";
            return;
        }

        const scrollY = window.scrollY;

        document.body.style.position = "fixed";
        document.body.style.top = `-${scrollY}px`;
        document.body.style.left = "0";
        document.body.style.right = "0";
        document.body.style.width = "100%";
        document.body.style.overflow = "hidden";

        return () => {
            const y = document.body.style.top;

            document.body.style.position = "";
            document.body.style.top = "";
            document.body.style.left = "";
            document.body.style.right = "";
            document.body.style.width = "";
            document.body.style.overflow = "";

            window.scrollTo(0, parseInt(y || "0") * -1);
        };
    }, [isEditing, isCropping]);


    return (
        <div className="relative">
            {ctaText && (
                <p
                    className="text-sm font-semibold text-left pb-2"
                    style={{ color: t?.text }}
                >
                    {ctaText}
                </p>
            )}

            {/* ROUND EDIT ICON */}
            {editable !== false && (<button
                onClick={() => setIsEditing(true)}
                className="absolute top-2 right-0 z-20 h-9 w-9 rounded-full shadow
    flex items-center justify-center transition hover:scale-105
    bg-orange-500 text-white"
                title="Edit"
            >
                <Pencil size={16} />
            </button>
            )}

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

            {/* ---------- EDIT POPUP ---------- */}
            {isEditing && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50
                  touch-none overscroll-none">
                    <div
                        className="bg-white rounded-2xl w-80 p-4 space-y-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="font-semibold text-lg">Edit Banner</h3>

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

                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-600">
                                CTA Text
                            </label>
                            <input
                                className="w-full border rounded-xl p-2 text-sm"
                                placeholder="e.g. Shop Now"
                                value={draftText}
                                onChange={(e) => setDraftText(e.target.value)}
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-600">
                                CTA Link
                            </label>
                            <input
                                className="w-full border rounded-xl p-2 text-sm"
                                placeholder="https://your-link.com"
                                value={draftUrl}
                                onChange={(e) => setDraftUrl(e.target.value)}
                            />
                        </div>

                        <div className="flex gap-2 pt-2">
                            <button
                                onClick={() => setIsEditing(false)}
                                className="flex-1 border rounded-xl p-2"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={saveText}
                                className="flex-1 bg-purple-600 text-white rounded-xl p-2"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}


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
