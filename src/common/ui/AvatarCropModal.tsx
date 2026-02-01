import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";

type Props = {
  file: File;
  onCancel: () => void;
  onSave: (blob: Blob) => void;
};

export default function AvatarCropModal({ file, onCancel, onSave }: Props) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState<any>(null);

  const onCropComplete = useCallback((_: any, area: any) => {
    setCroppedArea(area);
  }, []);

  // const getCroppedBlob = async () => {
  //   const img = new Image();
  //   img.src = URL.createObjectURL(file);
  //   await new Promise((res) => (img.onload = res));

  //   const canvas = document.createElement("canvas");
  //   canvas.width = croppedArea.width;
  //   canvas.height = croppedArea.height;

  //   const ctx = canvas.getContext("2d")!;
  //   ctx.drawImage(
  //     img,
  //     croppedArea.x,
  //     croppedArea.y,
  //     croppedArea.width,
  //     croppedArea.height,
  //     0,
  //     0,
  //     croppedArea.width,
  //     croppedArea.height
  //   );

  //   return new Promise<Blob>((resolve) =>
  //     canvas.toBlob((b) => resolve(b!), "image/jpeg", 0.95)
  //   );
  // };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 flex items-center justify-center">
      <div className="bg-white rounded-xl w-[640px] max-w-[95vw]">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h3 className="text-lg font-semibold">Drag to Reposition</h3>
          <button onClick={onCancel} className="text-xl">✕</button>
        </div>

        <div className="relative h-[380px] bg-black">
          <Cropper
            image={URL.createObjectURL(file)}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>

        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            🔍
            <input
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-48"
            />
            ＋
          </div>

          <div className="flex gap-3">
            <button onClick={onCancel} className="px-5 py-2 rounded-lg border">
              Cancel
            </button>
            <button
              onClick={async () => {
                const blob = await (async () => {
                  const img = new Image();
                  img.src = URL.createObjectURL(file);
                  await new Promise((r) => (img.onload = r));
                  const canvas = document.createElement("canvas");
                  canvas.width = croppedArea.width;
                  canvas.height = croppedArea.height;
                  const ctx = canvas.getContext("2d")!;
                  ctx.drawImage(
                    img,
                    croppedArea.x,
                    croppedArea.y,
                    croppedArea.width,
                    croppedArea.height,
                    0,
                    0,
                    croppedArea.width,
                    croppedArea.height
                  );
                  return new Promise<Blob>((resolve) =>
                    canvas.toBlob((b) => resolve(b!), "image/jpeg", 0.95)
                  );
                })();
                onSave(blob);
              }}
              className="px-5 py-2 rounded-lg bg-black text-white"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
