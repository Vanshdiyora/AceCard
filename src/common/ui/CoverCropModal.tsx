import { useEffect, useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { createPortal } from "react-dom";

type Props = {
  file: File;
  onCancel: () => void;
  onSave: (blob: Blob) => void;
};

export default function CoverCropModal({ file, onCancel, onSave }: Props) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState<any>(null);
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const onCropComplete = useCallback((_: any, area: any) => {
    setCroppedArea(area);
  }, []);

  const getCroppedBlob = async () => {
    const img = new Image();
    img.src = imageUrl;
    await new Promise((r) => (img.onload = r));

    const canvas = document.createElement("canvas");

    canvas.width = 1500;
    canvas.height = 500;

    const ctx = canvas.getContext("2d")!;

    ctx.drawImage(
      img,
      croppedArea.x,
      croppedArea.y,
      croppedArea.width,
      croppedArea.height,
      0,
      0,
      canvas.width,
      canvas.height
    );

    return new Promise<Blob>((resolve) =>
      canvas.toBlob((b) => resolve(b!), "image/jpeg", 0.95)
    );
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      
      {/* BACKDROP */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* MODAL */}
      <div className="relative bg-white rounded-2xl w-[820px] max-w-[96vw] shadow-2xl overflow-hidden">

        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center gap-3">
            <button onClick={onCancel} className="text-lg">←</button>
            <h3 className="font-semibold text-lg">Drag to Reposition</h3>
          </div>
          <button onClick={onCancel} className="text-xl">✕</button>
        </div>

        {/* CROPPER */}
        <div className="relative w-full aspect-[3/1] bg-black overflow-hidden">

          {imageUrl && (
            <>
              <Cropper
                image={imageUrl}
                crop={crop}
                zoom={zoom}
                aspect={3 / 1}
                cropShape="rect"
                showGrid={false}
                objectFit="cover"
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />

              {/* MOBILE SAFE AREA */}
              <div className="pointer-events-none absolute inset-0 flex justify-center items-center">
                
                <div className="w-[70%] h-full border-2 border-white/80 rounded-md shadow-[0_0_0_9999px_rgba(0,0,0,0.4)]">
                </div>

              </div>
            </>
          )}

        </div>

        {/* FOOTER */}
        <div className="px-6 py-4 flex items-center justify-between">
          
          <div className="flex items-center gap-3">
            <span>−</span>
            <input
              type="range"
              min={0.8}
              max={3}
              step={0.01}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-28 sm:w-40 md:w-48"
            />
            <span>＋</span>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="px-5 py-2 rounded-full border bg-white"
            >
              Cancel
            </button>
            <button
              onClick={async () => onSave(await getCroppedBlob())}
              className="px-6 py-2 rounded-full bg-gray-900 text-white"
            >
              Save
            </button>
          </div>

        </div>

      </div>
    </div>,
    document.body
  );
}