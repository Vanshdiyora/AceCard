import { arrayMove } from "@dnd-kit/sortable";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
    SortableContext,
    verticalListSortingStrategy,
    useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { ReactNode } from "react";

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

export default function LinksFilesSection({
    value,
    onChange,
}: {
    value: { items: Item[] };
    onChange: (v: { items: Item[] }) => void;
}) {
    const items = [...value.items].sort((a, b) => a.rank - b.rank);

    const addItem = () =>
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

    const removeItem = (id: string) => {
        const next = items
            .filter((i) => i.id !== id)
            .map((i, idx) => ({ ...i, rank: idx + 1 }));

        onChange({ ...value, items: next });
    };

    return (
        <div className="space-y-4">
            <button
                onClick={addItem}
                className="px-4 py-2 rounded bg-purple-600 text-white"
            >
                + Add Link / File
            </button>

            <DndContext
                collisionDetection={closestCenter}
                onDragEnd={(e) => {
                    const { active, over } = e;
                    if (!over) return; // ✅ TS-safe guard

                    const oldIndex = items.findIndex(
                        (i) => i.id === active.id
                    );
                    const newIndex = items.findIndex(
                        (i) => i.id === over.id
                    );

                    if (oldIndex === -1 || newIndex === -1) return;

                    const next = arrayMove(items, oldIndex, newIndex).map(
                        (i, idx) => ({ ...i, rank: idx + 1 })
                    );

                    onChange({ ...value, items: next });
                }}

            >
                <SortableContext
                    items={items.map((i) => i.id)}
                    strategy={verticalListSortingStrategy}
                >
                    <div className="space-y-3">
                        {items.map((item) => (
                            <SortableItem key={item.id} id={item.id}>
                                <div className="grid grid-cols-6 gap-2 items-center">
                                    <select
                                        value={item.type}
                                        onChange={(e) =>
                                            onChange({
                                                ...value,
                                                items: items.map((i) =>
                                                    i.id === item.id
                                                        ? { ...i, type: e.target.value as any }
                                                        : i
                                                ),
                                            })
                                        }
                                        className="border rounded p-2"
                                    >
                                        <option value="link">Link</option>
                                        <option value="file">File</option>
                                    </select>

                                    <input
                                        value={item.title}
                                        placeholder="Title"
                                        className="border rounded p-2"
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

                                    <input
                                        value={item.url}
                                        placeholder="Link URL"
                                        disabled={item.type === "file"}
                                        className="border rounded p-2"
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

                                    <input
                                        value={item.file_url}
                                        placeholder="File URL"
                                        disabled={item.type === "link"}
                                        className="border rounded p-2"
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

                                    <input
                                        value={item.file_type}
                                        placeholder="File type"
                                        disabled={item.type === "link"}   // ✅ disable for links
                                        className="border rounded p-2"
                                        onChange={(e) =>
                                            onChange({
                                                ...value,
                                                items: items.map((i) =>
                                                    i.id === item.id
                                                        ? { ...i, file_type: e.target.value }
                                                        : i
                                                ),
                                            })
                                        }
                                    />


                                    {/* DELETE */}
                                    <button
                                        type="button"
                                        onClick={() => removeItem(item.id)}
                                        className="text-red-500 hover:text-red-700 font-bold"
                                    >
                                        ✕
                                    </button>
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

export function SortableItem({
    id,
    children,
}: {
    id: string;
    children: ReactNode;
}) {
    const { attributes, listeners, setNodeRef, transform, transition } =
        useSortable({ id });

    return (
        <div
            ref={setNodeRef}
            style={{
                transform: CSS.Transform.toString(transform),
                transition,
            }}
            className="bg-white border rounded-lg p-3 shadow-sm"
        >
            {/* DRAG HANDLE */}
            <div
                className="flex items-center gap-2 mb-2 cursor-grab text-gray-500 select-none"
                {...attributes}
                {...listeners}
            >
                ☰ <span className="text-xs">Drag</span>
            </div>

            {children}
        </div>
    );
}
