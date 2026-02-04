import { useState } from "react";
import { uploadImage } from "../../../../publicProfile/services/publicProfile.api";
import { Input } from "../../../../teams/components/details/publicProfile/TeamMemberPublicProfileTab";
import CoverCropModal from "../../../../../common/ui/CoverCropModal";

export default function PhotoGallerySection({
  value,
  onChange,
  disabled = false,
}: {
  value: any;
  onChange: (v: any) => void;
  disabled?: boolean;
}) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [cropFile, setCropFile] = useState<File | null>(null);
  const [cropIndex, setCropIndex] = useState<number | null>(null);

  const saveCropped = async (blob: Blob) => {
    if (cropIndex === null) return;

    const file = new File([blob], "gallery.jpg", { type: "image/jpeg" });
    const res = await uploadImage(file);

    const items = [...value.items];
    items[cropIndex] = { ...items[cropIndex], img_url: res.data.url };

    onChange({ ...value, items });
    setCropFile(null);
    setCropIndex(null);
  };

  const addPhotoItem = () => {
    onChange({
      ...value,
      items: [
        {
          title: "",
          description: "",
          link: "",
          img_url: "",
          rank: 1,
          enabled: true,
        },
        ...value.items,
      ],
    });
  };

  const reorder = (from: number, to: number) => {
    if (from === to) return;
    const items = [...value.items];
    const [moved] = items.splice(from, 1);
    items.splice(to, 0, moved);

    onChange({
      ...value,
      items: items.map((p, i) => ({ ...p, rank: i + 1 })),
    });
  };

  const removePhoto = (index: number) => {
    const items = value.items
      .filter((_: any, i: number) => i !== index)
      .map((p: any, i: number) => ({ ...p, rank: i + 1 }));

    onChange({ ...value, items });
  };

  if (!value) return null;

  return (
    <div className="space-y-4 mt-4">
      {/* Section title */}
      <div className="space-y-1">
        <p className="text-xs uppercase tracking-wide text-gray-500">
          Section label
        </p>
        <Input
          value={value.section_title}
          disabled={disabled}
          placeholder="Section title"
          onChange={(v: any) => onChange({ ...value, section_title: v })}
        />
      </div>

      {!disabled && (
        <button
          onClick={addPhotoItem}
          className="w-full py-2 rounded-xl border border-dashed text-sm text-gray-600 hover:bg-gray-100"
        >
          ➕ Add Photo
        </button>
      )}

      {value.items.map((item: any, i: number) => (
        <div
          key={i}
          draggable={!disabled}
          onDragStart={() => setDragIndex(i)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => {
            if (dragIndex !== null) reorder(dragIndex, i);
            setDragIndex(null);
          }}
          className={`group rounded-2xl border bg-white/80 p-4 space-y-4 shadow-sm
          ${dragIndex === i ? "opacity-50 ring-2 ring-purple-400" : ""}`}
        >
          {/* Drag */}
          <div className="text-gray-400 cursor-grab text-xl">☰</div>

          {/* Title + Link */}
          <Input
            value={item.title}
            placeholder="Title"
            disabled={disabled}
            onChange={(v: any) => {
              const items = [...value.items];
              items[i] = { ...items[i], title: v };
              onChange({ ...value, items });
            }}
          />

          {/* Image */}
          <div className="relative h-28 w-28 rounded-xl overflow-hidden bg-gray-100">
            {item.img_url && (
              <img src={item.img_url} className="w-full h-full object-cover" />
            )}

            {!disabled && (
              <label className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer">
                Change
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={(e) => {
                    if (!e.target.files) return;
                    setCropFile(e.target.files[0]);
                    setCropIndex(i);
                  }}
                />
              </label>
            )}
          </div>

          {/* Description */}
          <textarea
            value={item.description || ""}
            disabled={disabled}
            placeholder="Description..."
            className="w-full rounded-xl border p-3 text-sm"
            onChange={(e) => {
              const items = [...value.items];
              items[i] = { ...items[i], description: e.target.value };
              onChange({ ...value, items });
            }}
          />

          {!disabled && (
            <button
              onClick={() => removePhoto(i)}
              className="text-xs text-red-600"
            >
              Delete
            </button>
          )}
        </div>
      ))}

      {cropFile && (
        <CoverCropModal
          file={cropFile}
          onCancel={() => {
            setCropFile(null);
            setCropIndex(null);
          }}
          onSave={saveCropped}
        />
      )}
    </div>
  );
}
