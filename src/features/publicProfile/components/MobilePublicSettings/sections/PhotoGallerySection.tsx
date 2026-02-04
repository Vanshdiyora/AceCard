import { useState } from "react";
import { uploadImage } from "../../../../publicProfile/services/publicProfile.api";
import { Toggle,Input } from "../../../../teams/components/details/publicProfile/TeamMemberPublicProfileTab";
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
        ...value.items,
        {
          title: "",
          description: "",
          link: "",
          img_url: "",
          rank: value.items.length + 1,
          enabled: true,
        },
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
          onChange={(v:any) => onChange({ ...value, section_title: v })}
        />
      </div>

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
          className={`group rounded-2xl border bg-white/80 backdrop-blur shadow-sm p-4 sm:p-5 space-y-4 transition 
          ${
            dragIndex === i
              ? "opacity-50 ring-2 ring-purple-400"
              : "hover:shadow-md"
          }`}
        >
          {/* ROW 1 */}
          <div className="flex flex-col sm:flex-row sm:flex-wrap md:flex-nowrap items-start sm:items-center gap-3 sm:gap-4">
            {/* Drag */}
            <div className="flex flex-col items-center text-gray-400 cursor-grab select-none">
              <span className="text-xl">☰</span>
            </div>

            {/* Title + Link */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1 w-full">
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wide text-gray-500">
                  Title
                </p>
                <Input
                  value={item.title}
                  disabled={disabled}
                  placeholder="Photo title"
                  onChange={(v:any) => {
                    const items = [...value.items];
                    items[i] = { ...items[i], title: v };
                    onChange({ ...value, items });
                  }}
                />
              </div>

              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wide text-gray-500">
                  Link
                </p>
                <Input
                  value={item.link}
                  disabled={disabled}
                  placeholder="External link"
                  onChange={(v:any) => {
                    const items = [...value.items];
                    items[i] = { ...items[i], link: v };
                    onChange({ ...value, items });
                  }}
                />
              </div>
            </div>

            {/* Show + Delete */}
            <div className="flex justify-between sm:justify-start items-center gap-3 w-full sm:w-auto">
              <div className="flex items-center gap-1">
                <p className="text-xs uppercase tracking-wide text-gray-500">
                  Show
                </p>
                <Toggle
                  label=""
                  value={item.enabled}
                  onChange={(v: any) => {
                    const items = [...value.items];
                    items[i] = { ...items[i], enabled: v };
                    onChange({ ...value, items });
                  }}
                />
              </div>

              {!disabled && (
                <button
                  onClick={() => removePhoto(i)}
                  className="h-9 px-4 text-xs rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
                >
                  Delete
                </button>
              )}
            </div>
          </div>

          {/* ROW 2 */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-5">
            {/* Image */}
            <div className="space-y-1 mx-auto sm:mx-0">
              <p className="text-xs uppercase tracking-wide text-gray-500">
                Image
              </p>
              <div className="relative h-28 w-28 rounded-xl overflow-hidden bg-gray-100 shadow-sm">
                {item.img_url ? (
                  <img
                    src={item.img_url}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                    Upload
                  </div>
                )}

                {!disabled && (
                  <label className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition">
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
            </div>

            {/* Description */}
            <div className="flex-1 space-y-1">
              <p className="text-xs uppercase tracking-wide text-gray-500">
                Description
              </p>
              <textarea
                value={item.description || ""}
                disabled={disabled}
                placeholder="Short description..."
                className="w-full min-h-[90px] sm:min-h-[110px] rounded-xl border border-gray-200 bg-white/70 px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                onChange={(e) => {
                  const items = [...value.items];
                  items[i] = { ...items[i], description: e.target.value };
                  onChange({ ...value, items });
                }}
              />
            </div>
          </div>
        </div>
      ))}

      {!disabled && (
        <button
          onClick={addPhotoItem}
          className="mt-4 w-full sm:w-auto px-4 py-3 rounded-lg bg-purple-600 text-white text-sm"
        >
          + Add Photo
        </button>
      )}

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
