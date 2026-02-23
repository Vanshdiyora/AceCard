import { useState, useMemo, useEffect } from "react";
import CommonItemsReorder from "../../../../settings/components/vice/sections/CommonItemsReorder";
import { uploadImage } from "../../../../publicProfile/services/publicProfile.api";
import { Input } from "../../../../teams/components/details/publicProfile/TeamMemberPublicProfileTab";
import CoverCropModal from "../../../../../common/ui/CoverCropModal";

export default function PhotoGallerySection({
  value,
  onChange,
  disabled = false,
  onValidationChange, // 👈 NEW
}: {
  value: any;
  onChange: (v: any) => void;
  disabled?: boolean;
  onValidationChange?: (valid: boolean) => void; // 👈 NEW
}) {
  if (!value) return null;

const items = (value.items || []).map((item: any, index: number) => ({
  ...item,
  id: item.id && item.id !== 0
    ? item.id
    : `photo-${index}-${Date.now()}`,
}));

  const [cropFile, setCropFile] = useState<File | null>(null);
  const [cropIndex, setCropIndex] = useState<number | null>(null);
const isValid = useMemo(() => {
  return items.every(
    (i: any) =>
      i.title?.trim() &&
      i.img_url?.trim()
  );
}, [items]);

useEffect(() => {
  onValidationChange?.(isValid);
}, [isValid]);

  const saveCropped = async (blob: Blob) => {
    if (cropIndex === null) return;

    const file = new File([blob], "gallery.jpg", {
      type: "image/jpeg",
    });

    const res = await uploadImage(file);

    const next = items.map((i:any, idx:any) =>
      idx === cropIndex ? { ...i, img_url: res.data.url } : i
    );

    onChange({
      ...value,
      items: next.map((i:any, idx:any) => ({
        ...i,
        rank: idx + 1,
      })),
    });

    setCropFile(null);
    setCropIndex(null);
  };

  const addItem = () => {
    if (disabled) return;

    const next = [
      ...items,
      {
        id: crypto.randomUUID(),
        title: "",
        description: "",
        link: "",
        img_url: "",
        enabled: true,
        rank: items.length + 1,
      },
    ];

    onChange({
      ...value,
      items: next,
    });
  };

  const removeItem = (id: string) => {
    if (disabled) return;

    const next = items
      .filter((i:any) => i.id !== id)
      .map((i:any, idx:any) => ({
        ...i,
        rank: idx + 1,
      }));

    onChange({
      ...value,
      items: next,
    });
  };

  return (
    <div className="space-y-6">

      {/* SECTION TITLE */}
      <div className="space-y-1">
        <p className="text-xs uppercase tracking-wide text-gray-500">
          Section label
        </p>
        <Input
          value={value.section_title}
          disabled={disabled}
          onChange={(v) =>
            onChange({ ...value, section_title: v })
          }
        />
      </div>

      {!disabled && (
        <button
          onClick={addItem}
          className="w-full py-2 rounded-xl border border-dashed text-sm text-gray-600 hover:bg-gray-100"
        >
          ➕ Add Photo
        </button>
      )}

      {/* ✅ USING COMMON REORDER */}
      <CommonItemsReorder
        items={items}
        onChange={(updated) =>
          onChange({
            ...value,
            items: updated.map((i, idx) => ({
              ...i,
              rank: idx + 1,
            })),
          })
        }
        renderItem={(item: any, index: number) => (
          <div className="rounded-2xl border bg-white/80 p-4 space-y-4 shadow-sm">

            {/* HEADER */}
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">
                Drag
              </span>

              {!disabled && (
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-xs text-red-600"
                >
                  Delete
                </button>
              )}
            </div>

            {/* TITLE */}
            <Input
              value={item.title}
              placeholder="Title"
              disabled={disabled}
              onChange={(v) =>
                onChange({
                  ...value,
                  items: items.map((i:any) =>
                    i.id === item.id
                      ? { ...i, title: v }
                      : i
                  ),
                })
              }
            />

            {/* IMAGE */}
            <div className="relative h-28 w-28 rounded-xl overflow-hidden bg-gray-100">
              {item.img_url && (
                <img
                  src={item.img_url}
                  className="w-full h-full object-cover"
                />
              )}

              {!disabled && (
                <label className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 hover:opacity-100 cursor-pointer">
                  Change
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={(e) => {
                      if (!e.target.files) return;
                      setCropFile(e.target.files[0]);
                      setCropIndex(index);
                    }}
                  />
                </label>
              )}
            </div>

            {/* DESCRIPTION */}
            <textarea
              value={item.description || ""}
              disabled={disabled}
              placeholder="Description..."
              className="w-full rounded-xl border p-3 text-sm"
              onChange={(e) =>
                onChange({
                  ...value,
                  items: items.map((i:any) =>
                    i.id === item.id
                      ? {
                          ...i,
                          description: e.target.value,
                        }
                      : i
                  ),
                })
              }
            />
          </div>
        )}
      />

      {/* CROP MODAL */}
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