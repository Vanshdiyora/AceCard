import { arrayMove } from "@dnd-kit/sortable";
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
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";

/* ================= TYPES ================= */

interface Item {
  id: string;
  type: "link" | "file";
  title: string;
  url: string;
  file_url: string;
  file_type: string;
  rank: number;
  enabled: boolean;
}

/* ================= MAIN ================= */

export default function LinksFilesSection({
  value,
  onChange,
  disabled = false,
}: {
  value: { items: Item[] };
  onChange: (v: { items: Item[] }) => void;
  disabled?: boolean;
}) {
  const items = [...value.items].sort((a, b) => a.rank - b.rank);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
  );

  const [dragging, setDragging] = useState(false);

  // 🔒 lock page scroll while dragging
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
    onChange({
      ...value,
      items: [
        ...items,
        {
          id: crypto.randomUUID(),
          type: "link",
          title: "",
          url: "",
          file_url: "",
          file_type: "",
          rank: items.length + 1,
          enabled: true,
        },
      ],
    });
  };

  const removeItem = (id: string) => {
    if (disabled) return;
    const next = items
      .filter((i) => i.id !== id)
      .map((i, idx) => ({ ...i, rank: idx + 1 }));
    onChange({ ...value, items: next });
  };

  return (
    <div className="space-y-4 w-full">
      {/* ADD */}
      <div className="w-full sm:w-44">
        <button
          onClick={addItem}
          disabled={disabled}
          className={`w-full px-4 py-3 sm:py-2 rounded text-white text-sm ${
            disabled
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-purple-600"
          }`}
        >
          + Add Link / File
        </button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={() => setDragging(true)}
        onDragCancel={() => setDragging(false)}
        onDragEnd={(e) => {
          setDragging(false);
          if (disabled) return;

          const { active, over } = e;
          if (!over) return;

          const oldIndex = items.findIndex((i) => i.id === active.id);
          const newIndex = items.findIndex((i) => i.id === over.id);
          if (oldIndex === -1 || newIndex === -1) return;

          const next = arrayMove(items, oldIndex, newIndex).map((i, idx) => ({
            ...i,
            rank: idx + 1,
          }));

          onChange({ ...value, items: next });
        }}
      >
        <SortableContext
          items={items.map((i) => i.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-4">
            {items.map((item) => (
              <SortableItem
                key={item.id}
                id={item.id}
                disabled={disabled}
                onRemove={() => removeItem(item.id)}
              >
                {/* DESKTOP REMOVE */}
                <button
                  onClick={() => removeItem(item.id)}
                  disabled={disabled}
                  className={`hidden md:flex absolute top-2 right-2 font-bold ${
                    disabled
                      ? "text-gray-300 cursor-not-allowed"
                      : "text-red-500 hover:text-red-700"
                  }`}
                >
                  ✕
                </button>

                {/* FORM GRID */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                  {/* TYPE */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-gray-500 mb-1">
                      Type
                    </label>
                    <CustomSelect
                      disabled={disabled}
                      value={item.type}
                      onChange={(v) =>
                        onChange({
                          ...value,
                          items: items.map((i) =>
                            i.id === item.id
                              ? {
                                  ...i,
                                  type: v,
                                  url: v === "link" ? i.url : "",
                                  file_url: v === "file" ? i.file_url : "",
                                  file_type: v === "file" ? i.file_type : "",
                                }
                              : i
                          ),
                        })
                      }
                    />
                  </div>

                  {/* TITLE */}
                  <div className="md:col-span-3">
                    <label className="block text-xs font-semibold text-gray-500 mb-1">
                      Title
                    </label>
                    <input
                      disabled={disabled}
                      value={item.title}
                      placeholder="e.g. Website"
                      className="border rounded p-3 text-sm w-full"
                      onChange={(e) =>
                        onChange({
                          ...value,
                          items: items.map((i) =>
                            i.id === item.id
                              ? { ...i, title: e.target.value }
                              : i
                          ),
                        })
                      }
                    />
                  </div>

                  {/* LINK URL */}
                  {item.type === "link" && (
                    <div className="md:col-span-7">
                      <label className="block text-xs font-semibold text-gray-500 mb-1">
                        Link URL
                      </label>
                      <input
                        disabled={disabled}
                        value={item.url}
                        placeholder="https://example.com"
                        className="border rounded p-3 text-sm w-full"
                        onChange={(e) =>
                          onChange({
                            ...value,
                            items: items.map((i) =>
                              i.id === item.id
                                ? { ...i, url: e.target.value }
                                : i
                            ),
                          })
                        }
                      />
                    </div>
                  )}

                  {/* FILE FIELDS */}
                  {item.type === "file" && (
                    <>
                      <div className="md:col-span-4">
                        <label className="block text-xs font-semibold text-gray-500 mb-1">
                          File URL
                        </label>
                        <input
                          disabled={disabled}
                          value={item.file_url}
                          placeholder="https://file.pdf"
                          className="border rounded p-3 text-sm w-full"
                          onChange={(e) =>
                            onChange({
                              ...value,
                              items: items.map((i) =>
                                i.id === item.id
                                  ? { ...i, file_url: e.target.value }
                                  : i
                              ),
                            })
                          }
                        />
                      </div>
                    </>
                  )}
                </div>
              </SortableItem>
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}

/* ================= SORTABLE ITEM ================= */

function SortableItem({
  id,
  children,
  disabled,
  onRemove,
}: {
  id: string;
  children: ReactNode;
  disabled?: boolean;
  onRemove?: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id, disabled });

  return (
    <div
      ref={setNodeRef}
      {...(!disabled ? attributes : {})}
      {...(!disabled ? listeners : {})}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className="relative bg-white border rounded-lg p-3 shadow-sm cursor-grab"
    >
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs text-gray-400">☰ Drag row</span>

        {onRemove && (
          <button
            onClick={onRemove}
            disabled={disabled}
            className={`md:hidden font-bold ${
              disabled
                ? "text-gray-300 cursor-not-allowed"
                : "text-red-500 hover:text-red-700"
            }`}
          >
            ✕
          </button>
        )}
      </div>

      {children}
    </div>
  );
}

/* ================= CUSTOM SELECT ================= */

function CustomSelect({
  value,
  onChange,
  disabled,
}: {
  value: "link" | "file";
  onChange: (v: "link" | "file") => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);

  const options = [
    { value: "link", label: "Link" },
    { value: "file", label: "File" },
  ] as const;

  const current = options.find((o) => o.value === value);

  return (
    <div className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((v) => !v)}
        className={`w-full border rounded p-3 text-sm flex justify-between items-center ${
          disabled
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "bg-white hover:bg-gray-50"
        }`}
      >
        <span>{current?.label}</span>
        <span className="text-xs">▾</span>
      </button>

      {open && !disabled && (
        <div className="absolute z-50 mt-1 w-full bg-white border rounded shadow-lg">
          {options.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => {
                onChange(o.value);
                setOpen(false);
              }}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-indigo-50 ${
                value === o.value
                  ? "bg-indigo-100 font-semibold"
                  : ""
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
