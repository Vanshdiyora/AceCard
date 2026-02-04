import { useState } from "react";
import { Input, Toggle } from "../../../../teams/components/details/publicProfile/TeamMemberPublicProfileTab";

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
      {/* SECTION TITLE */}
      <div
        className={`space-y-1 ${disabled ? "opacity-60 pointer-events-none" : ""
          }`}
      >
        <p className="text-xs uppercase tracking-wide text-gray-500">
          Section Title
        </p>

        <Input
          value={value.section_title}
          placeholder="e.g. Video Gallery"
          onChange={(v:any) => onChange({ ...value, section_title: v })}
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
          className={`group rounded-2xl border bg-white/80 p-4 sm:p-5 space-y-4 shadow-sm transition
          ${dragIndex === i
              ? "opacity-50 ring-2 ring-purple-400"
              : "hover:shadow-md"
            }`}
        >
          {/* ROW 1 */}
          <div className="flex flex-col sm:flex-row sm:flex-wrap md:flex-nowrap items-start sm:items-center gap-3 sm:gap-4">
            {/* DRAG */}
            <div className="cursor-grab text-gray-400 text-xl">☰</div>

            {/* TITLE + URL */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1 w-full">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">
                  Title
                </p>
                <Input
                  value={item.title}
                  placeholder="e.g. Product Demo"
                  disabled={disabled}
                  onChange={(v:any) => {
                    const items = [...value.items];
                    items[i] = { ...items[i], title: v };
                    onChange({ ...value, items });
                  }}
                />
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">
                  Video URL
                </p>
                <Input
                  value={item.video_url}
                  placeholder="https://youtube.com/..."
                  disabled={disabled}
                  onChange={(v:any) => {
                    const items = [...value.items];
                    items[i] = { ...items[i], video_url: v };
                    onChange({ ...value, items });
                  }}
                />
              </div>
            </div>

            {/* SHOW + DELETE */}
            <div className="flex justify-between sm:justify-start items-center gap-3 w-full sm:w-auto">
              <Toggle
                label="Show"
                value={item.enabled}
                onChange={(v:any) => {
                  const items = [...value.items];
                  items[i] = { ...items[i], enabled: v };
                  onChange({ ...value, items });
                }}
              />

              {!disabled && (
                <button
                  onClick={() => removeItem(i)}
                  className="px-4 py-2 text-xs rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
                >
                  Delete
                </button>
              )}
            </div>
          </div>

          {/* ROW 2 */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <p className="text-xs uppercase tracking-wide text-gray-500">
                Description
              </p>
              <textarea
                value={item.description || ""}
                disabled={disabled}
                placeholder="Short description about the video..."
                className="w-full min-h-[90px] sm:min-h-[110px] rounded-xl border px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                onChange={(e) => {
                  const items = [...value.items];
                  items[i] = {
                    ...items[i],
                    description: e.target.value,
                  };
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
          className="mt-4 w-full sm:w-auto px-5 py-3 rounded-xl bg-purple-600 text-white"
        >
          + Add Video
        </button>
      )}
    </div>
  );
}
