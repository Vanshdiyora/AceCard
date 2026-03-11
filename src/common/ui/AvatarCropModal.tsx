import { useState, useCallback, useEffect } from "react";
import Cropper from "react-easy-crop";
import { createPortal } from "react-dom";

type Props = {
  file: File;
  onCancel: () => void;
  onSave: (blob: Blob) => void;
};

export default function AvatarCropModal({ file, onCancel, onSave }: Props) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [imageUrl, setImageUrl] = useState<string>("");

  /* create blob URL once */
  useEffect(() => {
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  /* lock body scroll while open */
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const onCropComplete = useCallback((_: any, areaPixels: any) => {
    setCroppedAreaPixels(areaPixels);
  }, []);

  const getCroppedBlob = async () => {
    const img = new Image();
    img.src = imageUrl;
    await new Promise((res) => (img.onload = res));

    const canvas = document.createElement("canvas");
    // Output at a fixed size so very small images still produce a decent avatar
    const OUTPUT_SIZE = 400;
    canvas.width = OUTPUT_SIZE;
    canvas.height = OUTPUT_SIZE;

    const ctx = canvas.getContext("2d")!;
    if (!croppedAreaPixels) return;

    ctx.drawImage(
      img,
      croppedAreaPixels.x,
      croppedAreaPixels.y,
      croppedAreaPixels.width,
      croppedAreaPixels.height,
      0,
      0,
      OUTPUT_SIZE,
      OUTPUT_SIZE
    );

    return new Promise<Blob>((resolve) =>
      canvas.toBlob((b) => resolve(b!), "image/jpeg", 0.95)
    );
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center animate-fadeIn">
      {/* BACKDROP */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* MODAL */}
      <div
        className="relative w-[720px] max-w-[95vw] rounded-3xl overflow-hidden
        bg-white/90 backdrop-blur-xl shadow-[0_20px_80px_rgba(0,0,0,0.45)]
        border border-white/30 animate-scaleIn"
      >
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/20 bg-white/70">
          <h3 className="text-lg font-semibold tracking-wide">
            Adjust your profile photo
          </h3>
          <button
            onClick={onCancel}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-black/10 transition"
          >
            ✕
          </button>
        </div>

        {/* CROPPER */}
        <div className="relative w-full h-[60vh] max-h-[420px] bg-black">
          {imageUrl && (
            <Cropper
              image={imageUrl}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropShape="round"
              showGrid={false}
              objectFit="contain"
              minZoom={0.2}
              maxZoom={10}
              restrictPosition={false}
              zoomWithScroll
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          )}
        </div>

        {/* FOOTER */}
        <div className="px-6 py-5 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between bg-white/70">
          {/* ZOOM */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <span className="text-sm text-gray-500 shrink-0">Zoom</span>
            <input
              type="range"
              // ✅ Slider min matches minZoom — no invisible dead zone
              min={0.2}
              max={10}
              step={0.01}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full sm:w-48 accent-black cursor-pointer"
            />
          </div>

          {/* ACTIONS */}
          <div className="flex justify-end gap-3">
            <button
              onClick={onCancel}
              className="px-5 py-2 rounded-xl border bg-white hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={async () => {
                const blob = await getCroppedBlob();
                if (blob) onSave(blob);
              }}
              className="px-6 py-2 rounded-xl text-white bg-gradient-to-r from-black to-gray-800 shadow-md hover:opacity-90 transition"
            >
              Save Photo
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}