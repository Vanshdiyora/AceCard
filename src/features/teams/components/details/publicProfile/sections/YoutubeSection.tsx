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

type Item = {
  id: string;
  url: string;
  rank: number;
  enabled: boolean;
};

export default function YoutubeSection({
  items,
  onChange,
}: {
  items: Item[];
  onChange: (items: Item[]) => void;
}) {
  const sorted = [...items].sort((a, b) => a.rank - b.rank);

  const add = () => {
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

  const remove = (id: string) =>
    onChange(sorted.filter((i) => i.id !== id));

  const update = (id: string, patch: Partial<Item>) =>
    onChange(
      sorted.map((i) => (i.id === id ? { ...i, ...patch } : i))
    );

  return (
    <div className="space-y-3">
      <DndContext
        collisionDetection={closestCenter}
        onDragEnd={({ active, over }) => {
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
            />
          ))}
        </SortableContext>
      </DndContext>

      <button
        onClick={add}
        className="px-3 py-2 bg-purple-600 text-white rounded"
      >
        + Add Video
      </button>
    </div>
  );
}

function Row({
  item,
  onUpdate,
  onRemove,
}: {
  item: Item;
  onUpdate: (id: string, p: Partial<Item>) => void;
  onRemove: (id: string) => void;
}) {
  const { setNodeRef, attributes, listeners, transform, transition } =
    useSortable({ id: item.id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className="flex items-center gap-2 bg-white border rounded-lg p-2"
    >
      <span
        {...attributes}
        {...listeners}
        className="cursor-grab"
      >
        ☰
      </span>

      <input
        value={item.url}
        onChange={(e) =>
          onUpdate(item.id, { url: e.target.value })
        }
        placeholder="YouTube / Video URL"
        className="flex-1 border rounded px-2 py-1 text-sm"
      />

      <input
        type="checkbox"
        checked={item.enabled}
        onChange={(e) =>
          onUpdate(item.id, { enabled: e.target.checked })
        }
      />

      <button
        onClick={() => onRemove(item.id)}
        className="text-red-500"
      >
        ✕
      </button>
    </div>
  );
}
