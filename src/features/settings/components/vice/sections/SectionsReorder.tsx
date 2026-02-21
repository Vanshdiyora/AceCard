import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  MeasuringStrategy,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import type { SectionItem } from "../../../../publicProfile/types";
import { GripVertical } from "lucide-react";

const HIDDEN_SECTIONS = ["video_gallery"];
const SECTION_LABELS: Record<string, string> = {
  youtube: "Videos",
  links_files: "Links & Files",
  photo_gallery: "Photo Gallery",
  social_links: "Social Links",
  meeting: "Meeting Button",
};

export default function SectionsReorder({
  sections,
  groupLocked,
  onChange,
  onSectionClick,
}: {
  sections: SectionItem[];
  groupLocked?: boolean;
  onChange: (s: SectionItem[]) => void;
  onSectionClick?: (type: string) => void;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 4,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 8,
      },
    })
  );

  const visibleSections = sections.filter(
    (s) => !HIDDEN_SECTIONS.includes(s.type)
  );

  const fixed = visibleSections.filter(
    (s) => s.type === "profile" && s.enabled
  );

  const movable = visibleSections.filter(
    (s) => s.type !== "profile" && s.enabled
  );

  const ordered = [...fixed, ...movable];

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      measuring={{
        droppable: {
          strategy: MeasuringStrategy.Always,
        },
      }}
      onDragEnd={(e) => {
        if (groupLocked) return;

        const { active, over } = e;
        if (!over || active.id === over.id) return;

        const oldIndex = movable.findIndex((s) => s.id === active.id);
        const newIndex = movable.findIndex((s) => s.id === over.id);

        if (oldIndex === -1 || newIndex === -1) return;

        const reordered = arrayMove(movable, oldIndex, newIndex);

        const next = [
          ...fixed,
          ...reordered.map((s, i) => ({
            ...s,
            rank: i + 1,
          })),
        ];

        onChange(next);
      }}
    >
      <SortableContext
        items={movable.map((s) => s.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-2">
          {ordered.map((s) =>
            s.type === "profile" ? (
              <FixedRow key={s.id} s={s} />
            ) : (
              <SortableRow
                key={s.id}
                s={s}
                disabled={groupLocked}
                onClick={() => onSectionClick?.(s.type)}
              />
            )
          )}
        </div>
      </SortableContext>
    </DndContext>
  );
}

/* ================= ROWS ================= */
function SortableRow({
  s,
  disabled,
  onClick,
}: {
  s: SectionItem;
  disabled?: boolean;
  onClick?: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: s.id, disabled });

  const style = {
    transform: transform
      ? `translate3d(${Math.round(transform.x)}px, ${Math.round(transform.y)}px, 0) scaleX(${transform.scaleX}) scaleY(${transform.scaleY})`
      : undefined,
    transition: isDragging ? "none" : transition,
    willChange: "transform",
    zIndex: isDragging ? 10 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={(e) => {
        if (disabled) return;
        if ((e.target as HTMLElement).closest(".drag-handle")) return;
        onClick?.();
      }}
      className={`flex items-center justify-between border rounded-lg p-3 shadow-sm cursor-pointer transition-colors
        ${isDragging ? "opacity-90 shadow-lg" : ""}
        ${disabled ? "bg-gray-100 opacity-60" : "bg-white hover:bg-gray-50"}
      `}
    >
      <div className="flex items-center gap-3">
        {!disabled && (
          <span
            className="cursor-grab touch-none select-none drag-handle"
            {...attributes}
            {...listeners}
            onClick={(e) => e.stopPropagation()}
          >
              <GripVertical size={18} />
          </span>
        )}
        <span className="font-medium text-sm capitalize">
          {SECTION_LABELS[s.type] || s.type.replace(/_/g, " ")}
        </span>
      </div>
    </div>
  );
}

function FixedRow({ s }: { s: SectionItem }) {
  return (
    <div className="flex items-center justify-between bg-gray-100 border rounded-lg p-3 opacity-70">
      <span className="capitalize">
        {SECTION_LABELS[s.type] || s.type.replace(/_/g, " ")} (fixed)
      </span>
    </div>
  );
}