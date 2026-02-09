import {
  DndContext,
  closestCenter,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";
import { isYoutubeRowComplete } from "../TeamMemberPublicProfileTab";

type Item = {
  id: string;
  url: string;
  rank: number;
  enabled: boolean;
};

export default function YoutubeSection({
  items,
  onChange,
  disabled = false,
}: {
  items: Item[];
  onChange: (items: Item[]) => void;
  disabled?: boolean;
}) {
  const sorted = [...items].sort((a, b) => a.rank - b.rank);
  const [error, setError] = useState<string | null>(null);

  const add = () => {
    if (disabled) return;

    const last = sorted[sorted.length - 1];

    if (!isYoutubeRowComplete(last)) {
      setError("Please complete the previous video before adding a new one.");
      return;
    }

    setError(null);

    onChange([
      ...sorted,
      {
        id: crypto.randomUUID(),
        url: "",
        rank: sorted.length + 1,
        enabled: true,
      },
    ]);
  };

  const remove = (id: string) => {
    if (disabled) return;
    onChange(sorted.filter((i) => i.id !== id));
  };

  const update = (id: string, patch: Partial<Item>) => {
    if (disabled) return;

    // clear error as soon as user starts fixing it
    if (patch.url !== undefined) {
      setError(null);
    }

    onChange(
      sorted.map((i) =>
        i.id === id ? { ...i, ...patch } : i
      )
    );
  };

  return (
    <div className={`space-y-3 ${disabled ? "opacity-60" : ""}`}>
      <DndContext
        collisionDetection={closestCenter}
        onDragEnd={({ active, over }) => {
          if (disabled) return;
          if (!over || active.id === over.id) return;

          const oldIndex = sorted.findIndex(
            (i) => i.id === active.id
          );
          const newIndex = sorted.findIndex(
            (i) => i.id === over.id
          );

          const next = arrayMove(sorted, oldIndex, newIndex).map(
            (i, idx) => ({ ...i, rank: idx + 1 })
          );
          onChange(next);
        }}
      >
        <SortableContext
          items={sorted.map((i) => i.id)}
          strategy={verticalListSortingStrategy}
        >
          {sorted.map((i) => (
            <Row
              key={i.id}
              item={i}
              onUpdate={update}
              onRemove={remove}
              disabled={disabled}
            />
          ))}
        </SortableContext>
      </DndContext>
      {error && (
        <p className="text-sm text-red-600">
          {error}
        </p>
      )}

      <button
        onClick={add}
        disabled={disabled}
        className={`px-3 py-2 rounded text-white ${disabled ? "bg-gray-400 cursor-not-allowed" : "bg-purple-600"
          }`}
      >
        + Add Video
      </button>
    </div>
  );
}

/* ================= ROW ================= */

function Row({
  item,
  onUpdate,
  onRemove,
  disabled,
}: {
  item: Item;
  onUpdate: (id: string, p: Partial<Item>) => void;
  onRemove: (id: string) => void;
  disabled?: boolean;
}) {
  const { setNodeRef, attributes, listeners, transform, transition } =
    useSortable({ id: item.id, disabled });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={`flex items-center gap-2 bg-white border rounded-lg p-2 ${disabled ? "opacity-60" : ""
        }`}
    >
      <span
        {...(!disabled ? attributes : {})}
        {...(!disabled ? listeners : {})}
        className={`${disabled ? "text-gray-300" : "cursor-grab"
          }`}
      >
        ☰
      </span>

      <input
        value={item.url}
        disabled={disabled}
        onChange={(e) =>
          onUpdate(item.id, { url: e.target.value })
        }
        placeholder="YouTube / Video URL"
        className="flex-1 border rounded px-2 py-1 text-sm"
      />

      <input
        type="checkbox"
        checked={item.enabled}
        disabled={disabled}
        onChange={(e) =>
          onUpdate(item.id, { enabled: e.target.checked })
        }
      />

      <button
        onClick={() => onRemove(item.id)}
        disabled={disabled}
        className={`${disabled
          ? "text-gray-300 cursor-not-allowed"
          : "text-red-500"
          }`}
      >
        ✕
      </button>
    </div>
  );
}
