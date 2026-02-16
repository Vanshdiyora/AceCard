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
import type { SectionItem } from "../../../../publicProfile/types";

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
}: {
  sections: SectionItem[];
  groupLocked?: boolean;
  onChange: (s: SectionItem[]) => void;
}) {
  // 🔥 Remove hidden sections completely
  const visibleSections = sections.filter(
    (s) => !HIDDEN_SECTIONS.includes(s.type)
  );

  // ✅ Only enabled sections
  const fixed = visibleSections.filter(
    (s) => s.type === "profile" && s.enabled
  );

  const movable = visibleSections
    .filter((s) => s.type !== "profile" && s.enabled)
    .sort((a, b) => a.rank - b.rank);

  const ordered = [...fixed, ...movable].sort(
    (a, b) => a.rank - b.rank
  );

  const minRank =
    visibleSections.length > 0
      ? Math.min(...visibleSections.map((s) => s.rank))
      : 1;

  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragEnd={(e) => {
        if (groupLocked) return;

        const { active, over } = e;
        if (!over || active.id === over.id) return;

        const oldIndex = movable.findIndex(
          (s) => s.id === active.id
        );
        const newIndex = movable.findIndex(
          (s) => s.id === over.id
        );

        if (oldIndex === -1 || newIndex === -1) return;

        const reordered = arrayMove(
          movable,
          oldIndex,
          newIndex
        ).map((s, i) => ({
          ...s,
          rank: minRank + fixed.length + i,
        }));

        const next = [...fixed, ...reordered];

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
}: {
  s: SectionItem;
  disabled?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: s.id, disabled });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={`flex items-center justify-between border rounded-lg p-3 shadow-sm ${
        disabled ? "bg-gray-100 opacity-60" : "bg-white"
      }`}
    >
      <div className="flex items-center gap-3">
        {!disabled && (
          <span
            className="cursor-grab"
            {...attributes}
            {...listeners}
          >
            ☰
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
