import { useEffect, useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { uploadImage } from "../../../../publicProfile/services/publicProfile.api";
import { Input } from "../../../../teams/components/details/publicProfile/TeamMemberPublicProfileTab";
import CoverCropModal from "../../../../../common/ui/CoverCropModal";

/* ================= MAIN ================= */

export default function PhotoGallerySection({
  value,
  onChange,
  disabled = false,
}: {
  value: any;
  onChange: (v: any) => void;
  disabled?: boolean;
}) {
  if (!value) return null;

  const items = [...value.items].sort((a, b) => a.rank - b.rank);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 5 },
    })
  );

  const [dragging, setDragging] = useState(false);
  const [cropFile, setCropFile] = useState<File | null>(null);
  const [cropIndex, setCropIndex] = useState<number | null>(null);

  // 🔒 lock body scroll while dragging
  useEffect(() => {
    if (!dragging) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [dragging]);

  const saveCropped = async (blob: Blob) => {
    if (cropIndex === null) return;

    const file = new File([blob], "gallery.jpg", { type: "image/jpeg" });
    const res = await uploadImage(file);

    const next = items.map((i, idx) =>
      idx === cropIndex ? { ...i, img_url: res.data.url } : i
    );

    onChange({ ...value, items: next });
    setCropFile(null);
    setCropIndex(null);
  };

  const addItem = () => {
    if (disabled) return;

    const next = [
      {
        title: "",
        description: "",
        link: "",
        img_url: "",
        enabled: true,
        rank: 1,
      },
      ...items,
    ].map((i, idx) => ({ ...i, rank: idx + 1 }));

    onChange({ ...value, items: next });
  };

  const removeItem = (rank: number) => {
    if (disabled) return;

    const next = items
      .filter((i) => i.rank !== rank)
      .map((i, idx) => ({ ...i, rank: idx + 1 }));

    onChange({ ...value, items: next });
  };

  return (
    <div className="space-y-4 mt-4">
      {/* HEADER */}
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

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={() => setDragging(true)}
        onDragCancel={() => setDragging(false)}
        onDragEnd={({ active, over }) => {
          setDragging(false);
          if (!over || disabled) return;

          const oldIndex = items.findIndex(
            (i) => i.rank === active.id
          );
          const newIndex = items.findIndex(
            (i) => i.rank === over.id
          );

          if (oldIndex === -1 || newIndex === -1) return;

          const next = arrayMove(items, oldIndex, newIndex).map(
            (i, idx) => ({ ...i, rank: idx + 1 })
          );

          onChange({ ...value, items: next });
        }}
      >
        <SortableContext
          items={items.map((i) => i.rank)}
          strategy={verticalListSortingStrategy}
        >
    <div className="space-y-4 mt-4 touch-pan-y">

            {items.map((item, index) => (
              <SortablePhotoRow
                key={item.rank}
                item={item}
                disabled={disabled}
                onRemove={() => removeItem(item.rank)}
                onImageChange={(file: any) => {
                  setCropFile(file);
                  setCropIndex(index);
                }}
                onChange={(patch: any) =>
                  onChange({
                    ...value,
                    items: items.map((i) =>
                      i.rank === item.rank ? { ...i, ...patch } : i
                    ),
                  })
                }
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

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

/* ================= SORTABLE ROW ================= */

function SortablePhotoRow({
  item,
  disabled,
  onRemove,
  onChange,
  onImageChange,
}: any) {
const {
  attributes,
  listeners,
  setNodeRef,
  transform,
  transition,
  isDragging,
} = useSortable({ id: item.rank, disabled });

  return (
    <div
      ref={setNodeRef}
     style={{
  transform: CSS.Transform.toString(transform),
  transition: isDragging ? transition : undefined,
}}

      className="group rounded-2xl border bg-white/80 p-4 space-y-4 shadow-sm
           select-none touch-pan-y"

    >
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <span
          {...attributes}
          {...listeners}
          className="text-gray-400 cursor-grab active:cursor-grabbing touch-none"
        >

          ☰ Drag
        </span>

        {!disabled && (
          <button
            onClick={onRemove}
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
        onChange={(v) => onChange({ title: v })}
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
          <label className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer">
            Change
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={(e) => {
                if (!e.target.files) return;
                onImageChange(e.target.files[0]);
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
          onChange({ description: e.target.value })
        }
      />
    </div>
  );
}
