import {
  DndContext,
  closestCenter,
  MouseSensor,
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
import { GripVertical } from "lucide-react";

interface ItemWithId {
  id: string;
  rank: number;
}

interface Props<T extends ItemWithId> {
  items: T[];
  onChange: (items: T[]) => void;
  renderItem: (item: T, index: number) => React.ReactNode;
  disabled?: boolean; // ✅ add this
}

export default function CommonItemsReorder<T extends ItemWithId>({
  items,
  onChange,
  renderItem,
  disabled = false,
}: Props<T>) {
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 150,
        tolerance: 5,
      },
    })
  );

  const handleDragEnd = (event: any) => {
    if (disabled) return; // ✅ prevents reorder
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);

    const reordered = arrayMove(items, oldIndex, newIndex).map(
      (item, index) => ({
        ...item,
        rank: index + 1,
      })
    );

    onChange(reordered);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={items.map((i) => i.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-4">
          {items.map((item, index) => (
            <SortableItem
              key={item.id}
              id={item.id}
              disabled={disabled} // ✅ pass it
            >
              {renderItem(item, index)}
            </SortableItem>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

function SortableItem({
  id,
  children,
  disabled = false, // ✅ add this
}: {
  id: string;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id, disabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative">
      {/* Drag Handle */}
      {!disabled && (
        <div {...attributes} {...listeners} className="absolute left-2 top-3 cursor-grab">
          <GripVertical size={18} />
        </div>
      )}

      <div className="pl-8">{children}</div>
    </div>
  );
}