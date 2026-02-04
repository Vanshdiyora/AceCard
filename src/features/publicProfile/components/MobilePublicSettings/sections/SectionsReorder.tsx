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
import type { SectionItem } from "../../../../teams/components/details/publicProfile/TeamMemberPublicProfileTab";

export default function SectionsReorder({
  sections,
  groupLocked,
  onChange,
}: {
  sections: SectionItem[];
  groupLocked?: boolean;
  onChange: (s: SectionItem[]) => void;
}) {
  const fixed = sections.filter((s) => s.type === "profile");

  const movable = sections
    .filter((s) => s.type !== "profile")
    .sort((a, b) => a.rank - b.rank);

  const ordered = [...fixed, ...movable].sort(
    (a, b) => a.rank - b.rank
  );

  const minRank = Math.min(...sections.map((s) => s.rank));

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

        const reordered = arrayMove(
          movable,
          oldIndex,
          newIndex
        ).map((s, i) => ({
          ...s,
          rank: minRank + fixed.length + i,
        }));

        const next = [...fixed, ...reordered].sort(
          (a, b) => a.rank - b.rank
        );

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
                onToggle={(v) =>
                  onChange(
                    sections.map((x) =>
                      x.id === s.id
                        ? { ...x, enabled: v }
                        : x
                    )
                  )
                }
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
  onToggle,
  disabled,
}: {
  s: SectionItem;
  onToggle: (v: boolean) => void;
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
        <span className="font-medium capitalize">
          {s.type.replace("_", " ")}
        </span>
      </div>

      <Toggle
        value={s.enabled}
        onChange={onToggle}
        disabled={disabled}
      />
    </div>
  );
}

function FixedRow({ s }: { s: SectionItem }) {
  return (
    <div className="flex items-center justify-between bg-gray-100 border rounded-lg p-3 opacity-70">
      <span className="capitalize">
        {s.type.replace("_", " ")} (fixed)
      </span>
    </div>
  );
}

/* ================= TOGGLE ================= */

function Toggle({
  value,
  onChange,
  disabled,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <label className={`flex items-center gap-2 ${
      disabled ? "cursor-not-allowed text-gray-400" : "cursor-pointer"
    }`}>
      <span className="text-sm">
        {value ? "On" : "Off"}
      </span>
      <input
        type="checkbox"
        checked={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
      />
    </label>
  );
}
