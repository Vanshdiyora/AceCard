import { useState } from "react";
import { uploadImage } from "../../../../../publicProfile/services/publicProfile.api";
import { Toggle, Input } from "../TeamMemberPublicProfileTab";
import CoverCropModal from "../../../../../../common/ui/CoverCropModal";
import { isPhotoRowComplete } from "../TeamMemberPublicProfileTab";

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
  const [error, setError] = useState<string | null>(null);

  /* ================= IMAGE SAVE ================= */

  const saveCropped = async (blob: Blob) => {
    if (cropIndex === null) return;

    const file = new File([blob], "gallery.jpg", {
      type: "image/jpeg",
    });

    const res = await uploadImage(file);

    const items = [...value.items];
    items[cropIndex] = {
      ...items[cropIndex],
      img_url: res.data.url,
    };

    setError(null); // ✅ clear validation error
    onChange({ ...value, items });

    setCropFile(null);
    setCropIndex(null);
  };

  /* ================= ADD ================= */

  const addPhotoItem = () => {
    if (disabled) return;

    const last = value.items[value.items.length - 1];

    if (!isPhotoRowComplete(last)) {
      setError(
        "Please complete the previous photo details before adding a new one."
      );
      return;
    }

    setError(null);

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

  /* ================= REORDER ================= */

  const reorder = (from: number, to: number) => {
    if (from === to) return;

    const items = [...value.items];
    const [moved] = items.splice(from, 1);
    items.splice(to, 0, moved);

    onChange({
      ...value,
      items: items.map((p, i) => ({
        ...p,
        rank: i + 1,
      })),
    });
  };

  /* ================= REMOVE ================= */

  const removePhoto = (index: number) => {
    const items = value.items
      .filter((_: any, i: number) => i !== index)
      .map((p: any, i: number) => ({ ...p, rank: i + 1 }));

    setError(null);
    onChange({ ...value, items });
  };

  if (!value) return null;

  // const lastIncomplete =
  //   value.items.length > 0 &&
  //   !isPhotoRowComplete(value.items[value.items.length - 1]);

  return (
    <div className="space-y-4 mt-4">
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
          className={`group rounded-2xl border bg-white/80 backdrop-blur shadow-sm p-4 sm:p-5 space-y-4 transition ${dragIndex === i
              ? "opacity-50 ring-2 ring-purple-400"
              : "hover:shadow-md"
            }`}
        >
          {/* ================= ROW 1 ================= */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Drag */}
            <div className="text-gray-400 cursor-grab select-none">
              ☰
            </div>

            {/* Title + Link */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
              <div>
                <p className="text-xs uppercase text-gray-500">Title</p>
                <Input
                  value={item.title}
                  disabled={disabled}
                  placeholder="Photo title"
                  onChange={(v) => {
                    setError(null);
                    const items = [...value.items];
                    items[i] = { ...items[i], title: v };
                    onChange({ ...value, items });
                  }}
                />
              </div>

              <div>
                <p className="text-xs uppercase text-gray-500">Link</p>
                <Input
                  value={item.link}
                  disabled={disabled}
                  placeholder="External link"
                  onChange={(v) => {
                    setError(null);
                    const items = [...value.items];
                    items[i] = { ...items[i], link: v }; // ✅ FIXED
                    onChange({ ...value, items });
                  }}
                />
              </div>
            </div>

            {/* Show + Delete */}
            <div className="flex items-center gap-3">
              <Toggle
                label=""
                value={item.enabled}
                onChange={(v) => {
                  const items = [...value.items];
                  items[i] = { ...items[i], enabled: v };
                  onChange({ ...value, items });
                }}
              />

              {!disabled && (
                <button
                  onClick={() => removePhoto(i)}
                  className="text-red-600 text-xs border px-3 py-2 rounded-lg hover:bg-red-50"
                >
                  Delete
                </button>
              )}
            </div>
          </div>

          {/* ================= ROW 2 ================= */}
          <div className="flex flex-col sm:flex-row gap-5">
            {/* Image */}
            <div>
              <p className="text-xs uppercase text-gray-500">Image</p>
              <div className="relative h-28 w-28 rounded-xl overflow-hidden bg-gray-100">
                {item.img_url ? (
                  <img
                    src={item.img_url}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-400">
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
            <div className="flex-1">
              <p className="text-xs uppercase text-gray-500">
                Description
              </p>
              <textarea
                value={item.description || ""}
                disabled={disabled}
                placeholder="Short description..."
                className="w-full min-h-[100px] rounded-xl border px-4 py-3 focus:ring-2 focus:ring-purple-500"
                onChange={(e) => {
                  const items = [...value.items];
                  items[i] = {
                    ...items[i],
                    description: e.target.value,
                  };
                  onChange({ ...value, items });
                }}
              />
            </div>
          </div>
        </div>
      ))}

      {/* ================= ERROR ================= */}
      {error && (
        <p className="text-sm text-red-600">
          {error}
        </p>
      )}

      {/* ================= ADD ================= */}
      {!disabled && (
        <button
          onClick={addPhotoItem}
          className="mt-4 px-4 py-3 rounded-lg bg-purple-600 text-white text-sm hover:opacity-90 transition"
        >
          + Add Photo
        </button>
      )}


      {/* ================= CROP MODAL ================= */}
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
