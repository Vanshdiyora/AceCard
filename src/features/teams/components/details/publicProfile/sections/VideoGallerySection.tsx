import { useState } from "react";
import { Toggle, Input } from "../TeamMemberPublicProfileTab";

export default function VideoGallerySection({
  value,
  onChange,
  disabled = false,
}: {
  value: any;
  onChange: (v: any) => void;
  disabled?: boolean;
}) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const addItem = () => {
    onChange({
      ...value,
      items: [
        ...value.items,
        {
          title: "",
          description: "",
          link: "",
          video_url: "",
          rank: value.items.length + 1,
          enabled: true,
        },
      ],
    });
  };

  const reorder = (from: number, to: number) => {
    if (from === to) return;
    const items = [...value.items];
    const [moved] = items.splice(from, 1);
    items.splice(to, 0, moved);
    onChange({
      ...value,
      items: items.map((p, i) => ({ ...p, rank: i + 1 })),
    });
  };

  const removeItem = (index: number) => {
    const items = value.items
      .filter((_: any, i: number) => i !== index)
      .map((p: any, i: number) => ({ ...p, rank: i + 1 }));
    onChange({ ...value, items });
  };

  if (!value) return null;

  return (
    <div className="space-y-4 mt-4">
      <div
        className={`space-y-1 ${disabled ? "opacity-60 pointer-events-none" : ""
          }`}
      >
        <p className="text-xs uppercase tracking-wide text-gray-500">
          Section Title
        </p>

        <Input
          value={value.section_title}
          placeholder="Video Gallery"
          onChange={(v) => onChange({ ...value, section_title: v })}
        />
      </div>


      {value.items.map((item: any, i: number) => (
        <div
          key={i}
          draggable={!disabled}
          onDragStart={() => setDragIndex(i)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => {
            if (dragIndex !== null) reorder(dragIndex, i);
            setDragIndex(null);
          }}
          className={`group rounded-2xl border bg-white/80 p-5 space-y-4 shadow-sm transition
          ${dragIndex === i ? "opacity-50 ring-2 ring-purple-400" : "hover:shadow-md"}`}
        >
          {/* ROW 1 */}
          <div className="flex items-center gap-4">
            <div className="cursor-grab text-gray-400 text-xl">☰</div>

            <div className="flex-1">
              <p className="text-xs uppercase tracking-wide text-gray-500">
                Title
              </p>
              <Input
                value={item.title}
                disabled={disabled}
                onChange={(v) => {
                  const items = [...value.items];
                  items[i] = { ...items[i], title: v };
                  onChange({ ...value, items });
                }}
              />
            </div>

            <div className="flex-1">
              <p className="text-xs uppercase tracking-wide text-gray-500">
                Video URL
              </p>
              <Input
                value={item.video_url}
                disabled={disabled}
                onChange={(v) => {
                  const items = [...value.items];
                  items[i] = { ...items[i], video_url: v };
                  onChange({ ...value, items });
                }}
              />
            </div>

            <Toggle
              label="Show"
              value={item.enabled}
              onChange={(v) => {
                const items = [...value.items];
                items[i] = { ...items[i], enabled: v };
                onChange({ ...value, items });
              }}
            />

            {!disabled && (
              <button
                onClick={() => removeItem(i)}
                className="px-3 py-1 text-xs border rounded text-red-600"
              >
                Delete
              </button>
            )}
          </div>

          {/* ROW 2 */}
          <div className="flex gap-4">
            <div className="flex-1">
              <p className="text-xs uppercase tracking-wide text-gray-500">
                Description
              </p>
              <textarea
                value={item.description || ""}
                disabled={disabled}
                className="w-full min-h-[90px] rounded-xl border px-4 py-3"
                onChange={(e) => {
                  const items = [...value.items];
                  items[i] = { ...items[i], description: e.target.value };
                  onChange({ ...value, items });
                }}
              />
            </div>
          </div>
        </div>
      ))}

      {!disabled && (
        <button
          onClick={addItem}
          className="mt-4 px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
        >
          + Add Video
        </button>
      )}
    </div>
  );
}
