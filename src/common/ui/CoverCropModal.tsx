import { useEffect, useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { createPortal } from "react-dom";

type Props = {
  file: File;
  onCancel: () => void;
  onSave: (blob: Blob) => Promise<void> | void;
};

export default function CoverCropModal({ file, onCancel, onSave }: Props) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [imageUrl, setImageUrl] = useState("");

  /* Load image */
  useEffect(() => {
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  /* Lock body scroll */
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  /* Crop complete */
  const onCropComplete = useCallback((_: any, croppedPixels: any) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  /* Create cropped image */
const getCroppedBlob = async (): Promise<Blob | undefined> => {
  if (!croppedAreaPixels) return;

  const img = new Image();
  img.src = imageUrl;

  await new Promise((resolve) => {
    img.onload = resolve;
  });

  // create canvas with crop size first
  const cropCanvas = document.createElement("canvas");
  cropCanvas.width = croppedAreaPixels.width;
  cropCanvas.height = croppedAreaPixels.height;

  const ctx = cropCanvas.getContext("2d")!;

  ctx.drawImage(
    img,
    croppedAreaPixels.x,
    croppedAreaPixels.y,
    croppedAreaPixels.width,
    croppedAreaPixels.height,
    0,
    0,
    croppedAreaPixels.width,
    croppedAreaPixels.height
  );

  // resize to banner output
  const finalCanvas = document.createElement("canvas");
  finalCanvas.width = 800;
  finalCanvas.height = 500;

  const finalCtx = finalCanvas.getContext("2d")!;

  finalCtx.drawImage(
    cropCanvas,
    0,
    0,
    cropCanvas.width,
    cropCanvas.height,
    0,
    0,
    finalCanvas.width,
    finalCanvas.height
  );

  return new Promise((resolve) =>
    finalCanvas.toBlob((blob) => resolve(blob!), "image/jpeg", 0.95)
  );
};
 return createPortal(
  <div className="fixed inset-0 z-[9999] flex items-center justify-center px-3">

    {/* Backdrop */}
    <div
      className="absolute inset-0 bg-black/50 backdrop-blur-sm"
      onClick={onCancel}
    />

    {/* Modal */}
    <div className="
      relative w-full max-w-3xl
      rounded-2xl overflow-hidden
      bg-white shadow-2xl
      flex flex-col
      max-h-[90vh]
    ">

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <div className="flex items-center gap-3">
          <button onClick={onCancel} className="text-lg">←</button>
          <h3 className="font-semibold text-base sm:text-lg">
            Drag to Reposition
          </h3>
        </div>

        <button
          onClick={onCancel}
          className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-200"
        >
          ✕
        </button>
      </div>

      {/* Crop Area */}
      <div className="
        relative w-full
        h-[45vh] sm:h-[360px]
        bg-black
      ">
        {imageUrl && (
          <Cropper
            image={imageUrl}
            crop={crop}
            zoom={zoom}
            aspect={1.2 / 1}
            cropShape="rect"
            showGrid={false}
            objectFit="cover"
            minZoom={1}
            maxZoom={5}
            restrictPosition={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        )}
      </div>

      {/* Footer */}
      <div className="
        px-4 py-4
        flex flex-col sm:flex-row
        gap-4
        sm:items-center sm:justify-between
      ">

        {/* Zoom */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <span className="text-sm text-gray-500">Zoom</span>

          <input
            type="range"
            min={0.3}
            max={5}
            step={0.01}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-full sm:w-48"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-5 py-2 rounded-lg border"
          >
            Cancel
          </button>

          <button
            onClick={async () => {
              const blob = await getCroppedBlob();
              if (!blob) return;
              onSave(blob);
            }}
            className="px-6 py-2 rounded-lg bg-black text-white"
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