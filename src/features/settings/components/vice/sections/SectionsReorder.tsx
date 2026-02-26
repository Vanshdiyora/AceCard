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
import { GripVertical, Trash2 } from "lucide-react";

const HIDDEN_SECTIONS = ["video_gallery"];

const SECTION_LABELS: Record<string, string> = {
  youtube: "Videos",
  links_files: "Links & Files",
  photo_gallery: "Photo Gallery",
  social_links: "Social Links",
  meeting: "Meeting Button",
  contact: "Lead Capture",
};

export default function SectionsReorder({
  sections,
  groupLocked,
  role,                 // 👈 ADD THIS
  onChange,
  onSectionClick,
  onToggle,
}: {
  sections: SectionItem[];
  groupLocked?: boolean;
  role?: string | null;        // 👈 ADD
  onChange: (s: SectionItem[]) => void;
  onSectionClick?: (type: string) => void;
  onToggle: (id: string, enabled: boolean) => void;
}) {
  const isReorderDisabled =
  groupLocked && role !== "vendor_admin";
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 4 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 8 },
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
        droppable: { strategy: MeasuringStrategy.Always },
      }}
      onDragEnd={(e) => {
        if (isReorderDisabled) return; // 🔥 stop reorder logic

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
                dragDisabled={isReorderDisabled}   // 👈 ONLY drag disabled
                onClick={() => onSectionClick?.(s.type)} // 👈 ALWAYS clickable
                onToggle={onToggle}
              />
            )
          )}
        </div>
      </SortableContext>
    </DndContext>
  );
}

/* ================= ROW ================= */

function SortableRow({
  s,
  dragDisabled,
  onClick,
  onToggle,
}: {
  s: SectionItem;
  dragDisabled?: boolean;
  onClick?: () => void;
  onToggle: (id: string, enabled: boolean) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: s.id,
    disabled: dragDisabled, // 🔥 drag only disabled
  });

  const style = {
    transform: transform
      ? `translate3d(${Math.round(transform.x)}px, ${Math.round(
          transform.y
        )}px, 0)`
      : undefined,
    transition: isDragging ? "none" : transition,
    zIndex: isDragging ? 10 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest(".drag-handle")) return;
        if ((e.target as HTMLElement).closest(".delete-btn")) return;
        onClick?.(); // 👈 ALWAYS works
      }}
      className={`flex items-center justify-between border rounded-lg p-3 shadow-sm cursor-pointer transition
        ${isDragging ? "opacity-90 shadow-lg" : ""}
        bg-white hover:bg-gray-50
      `}
    >
      <div className="flex items-center gap-3">
        <span
          className={`touch-none select-none drag-handle ${
            dragDisabled
              ? "cursor-not-allowed text-gray-300"
              : "cursor-grab"
          }`}
          {...(!dragDisabled ? attributes : {})}
          {...(!dragDisabled ? listeners : {})}
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical size={18} />
        </span>

        <span className="font-medium text-sm capitalize">
          {SECTION_LABELS[s.type] || s.type.replace(/_/g, " ")}
        </span>
      </div>

      {!dragDisabled && s.type !== "profile" && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggle(s.id, false);
          }}
          className="delete-btn text-gray-400 hover:text-red-500 transition"
        >
          <Trash2 size={18} />
        </button>
      )}
    </div>
  );
}

/* ================= FIXED ROW ================= */

function FixedRow({ s }: { s: SectionItem }) {
  return (
    <div className="flex items-center justify-between bg-gray-100 border rounded-lg p-3 opacity-70">
      <span className="capitalize">
        {SECTION_LABELS[s.type] || s.type.replace(/_/g, " ")} (fixed)
      </span>
    </div>
  );
}