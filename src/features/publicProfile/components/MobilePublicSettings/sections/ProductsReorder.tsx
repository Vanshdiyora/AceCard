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
import type { ProductRef } from "../../../../teams/components/details/publicProfile/TeamMemberPublicProfileTab";

export default function ProductsReorder({
  items,
  onChange,
  disabled = false,
}: {
  items: ProductRef[];
  onChange: (items: ProductRef[]) => void;
  disabled?: boolean;
}) {
  const sorted = [...items].sort((a, b) => a.rank - b.rank);

  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragEnd={(e) => {
        if (disabled) return;
        const { active, over } = e;
        if (!over || active.id === over.id) return;

        const oldIndex = sorted.findIndex(
          (p) => p.id === active.id
        );
        const newIndex = sorted.findIndex(
          (p) => p.id === over.id
        );

        const next = arrayMove(sorted, oldIndex, newIndex).map(
          (p, i) => ({ ...p, rank: i + 1 })
        );

        onChange(next);
      }}
    >
      <SortableContext
        items={sorted.map((p) => p.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className={`space-y-2 mt-4 ${disabled ? "opacity-60" : ""}`}>
          {sorted.map((p) => (
            <Row key={p.id} p={p} disabled={disabled} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

/* ================= ROW ================= */

function Row({
  p,
  disabled,
}: {
  p: ProductRef;
  disabled?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: p.id, disabled });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={`flex items-center justify-between border rounded-lg p-3 bg-white shadow-sm ${
        disabled ? "opacity-60" : ""
      }`}
    >
      <div className="flex items-center gap-3">
        <span
          className={`${
            disabled
              ? "text-gray-300"
              : "cursor-grab text-gray-400"
          }`}
          {...(!disabled ? attributes : {})}
          {...(!disabled ? listeners : {})}
        >
          ☰
        </span>
        <div>
          <p className="font-medium">{p.name}</p>
          <p className="text-xs text-gray-500">
            Rank: {p.rank}
          </p>
        </div>
      </div>

      <span className="text-sm text-gray-500">
        ₹{p.price}
      </span>
    </div>
  );
}
