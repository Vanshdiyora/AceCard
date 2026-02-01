import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";

type Props = {
  file: File;
  aspect?: number;
  onCancel: () => void;
  onComplete: (blob: Blob) => void;
};

export default function ImageCropperModal({
  file,
  aspect = 1,
  onCancel,
  onComplete,
}: Props) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState<any>(null);

  const onCropComplete = useCallback((_: any, area: any) => {
    setCroppedArea(area);
  }, []);

  const getCroppedBlob = async () => {
    const image = new Image();
    image.src = URL.createObjectURL(file);

    await new Promise((res) => (image.onload = res));

    const canvas = document.createElement("canvas");
    canvas.width = croppedArea.width;
    canvas.height = croppedArea.height;

    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(
      image,
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
  };

  const handleSave = async () => {
    const blob = await getCroppedBlob();
    onComplete(blob);
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 flex items-center justify-center">
      <div className="bg-white rounded-xl w-[90vw] max-w-md h-[500px] flex flex-col">
        <div className="relative flex-1">
          <Cropper
            image={URL.createObjectURL(file)}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>

        <div className="p-3 flex justify-between items-center border-t">
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
          />

          <div className="flex gap-2">
            <button onClick={onCancel} className="btn-outline">
              Cancel
            </button>
            <button onClick={handleSave} className="btn-primary">
              Crop & Upload
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
