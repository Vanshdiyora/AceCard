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
import { Toggle, Input } from "../../../../teams/components/details/publicProfile/TeamMemberPublicProfileTab";

/* ================= MAIN ================= */

export default function VideoGallerySection({
  value,
  onChange,
  disabled = false,
}: {
  value: any;
  onChange: (v: any) => void;
  disabled?: boolean;
}) {
  const items = [...value.items].sort((a, b) => a.rank - b.rank);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
  );

  const [dragging, setDragging] = useState(false);

  // 🔒 lock body scroll while dragging
  useEffect(() => {
    if (!dragging) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [dragging]);

  const addItem = () => {
    if (disabled) return;

    const next = [
      {
        title: "",
        description: "",
        video_url: "",
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
    <div className="space-y-4">
      {/* HEADER */}
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-wide text-gray-500">
            Section Title
          </p>
          <Input
            value={value.section_title}
            onChange={(v) =>
              onChange({ ...value, section_title: v })
            }
          />
        </div>

        {!disabled && (
          <button
            onClick={addItem}
            className="h-10 px-4 rounded-xl bg-purple-600 text-white text-sm font-semibold"
          >
            Add
          </button>
        )}
      </div>

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
          <div className="space-y-4">
            {items.map((item) => (
              <SortableVideoRow
                key={item.rank}
                item={item}
                disabled={disabled}
                onRemove={() => removeItem(item.rank)}
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
    </div>
  );
}

/* ================= SORTABLE ROW ================= */

function SortableVideoRow({
  item,
  disabled,
  onRemove,
  onChange,
}: any) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: item.rank, disabled });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className="bg-white border rounded-2xl p-4 shadow-sm
                 select-none touch-none cursor-grab"
    >
      {/* HEADER */}
      <div className="flex items-center justify-between mb-3">
        <span
          {...attributes}
          {...listeners}
          className="text-gray-400 cursor-grab active:cursor-grabbing"
        >
          ☰ Drag
        </span>

        {!disabled && (
          <button
            onClick={onRemove}
            className="text-red-500 text-sm"
          >
            ✕
          </button>
        )}
      </div>

      {/* FORM */}
      <div className="grid gap-3">
        <Input
          value={item.title}
          placeholder="Video title"
          disabled={disabled}
          onChange={(v) => onChange({ title: v })}
        />

        <Input
          value={item.video_url}
          placeholder="https://youtube.com/..."
          disabled={disabled}
          onChange={(v) => onChange({ video_url: v })}
        />

        <textarea
          value={item.description || ""}
          placeholder="Description"
          disabled={disabled}
          className="w-full min-h-[90px] rounded-xl border px-3 py-2"
          onChange={(e) =>
            onChange({ description: e.target.value })
          }
        />

        <Toggle
          label="Show"
          value={item.enabled}
          onChange={(v) => onChange({ enabled: v })}
        />
      </div>
    </div>
  );
}
