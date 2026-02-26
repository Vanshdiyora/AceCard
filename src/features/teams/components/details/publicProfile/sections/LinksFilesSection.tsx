import { useMemo, useState } from "react";
import CommonItemsReorder from "../../../../../settings/components/vice/sections/CommonItemsReorder";
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

/* ================= VALIDATION ================= */

function isLinkFileRowComplete(item?: Item) {
  if (!item) return true;

  if (!item.title || item.title.trim() === "") return false;

  if (item.type === "link") {
    return Boolean(item.url && item.url.trim());
  }

  if (item.type === "file") {
    return Boolean(item.file_url && item.file_url.trim());
  }

  return true;
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
const items = useMemo(
  () => [...value.items].sort((a, b) => a.rank - b.rank),
  [value.items]
);
  const [error, setError] = useState<string | null>(null);

  /* ================= ADD ================= */

  const addItem = () => {
    if (disabled) return;

    const last = items[items.length - 1];

    if (!isLinkFileRowComplete(last)) {
      setError("Please complete the previous row before adding a new one.");
      return;
    }

    setError(null);

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

  /* ================= REMOVE ================= */

  const removeItem = (id: string) => {
    if (disabled) return;

    setError(null);

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
          className={`w-full px-4 py-3 sm:py-2 rounded text-white text-sm ${disabled
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-purple-600 hover:opacity-90"
            }`}
        >
          + Add Link / File
        </button>
      </div>

      {/* ERROR */}
      {error && (
        <p className="text-sm text-red-600">
          {error}
        </p>
      )}
      <CommonItemsReorder
        items={items}
        onChange={(reordered) =>
          onChange({
            ...value,
            items: reordered,
          })
        }
        renderItem={(item) => (
          <div className="relative bg-white border rounded-lg p-3 shadow-sm">

            {/* DESKTOP REMOVE */}
            <button
              onClick={() => removeItem(item.id)}
              disabled={disabled}
              className={`hidden md:flex absolute top-2 right-2 font-bold ${disabled
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
                  onChange={(v) => {
                    setError(null);
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
                    });
                  }}
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
                  onChange={(e) => {
                    setError(null);
                    onChange({
                      ...value,
                      items: items.map((i) =>
                        i.id === item.id
                          ? { ...i, title: e.target.value }
                          : i
                      ),
                    });
                  }}
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
                    onChange={(e) => {
                      setError(null);
                      onChange({
                        ...value,
                        items: items.map((i) =>
                          i.id === item.id
                            ? { ...i, url: e.target.value }
                            : i
                        ),
                      });
                    }}
                  />
                </div>
              )}

              {/* FILE URL */}
              {item.type === "file" && (
                <div className="md:col-span-4">
                  <label className="block text-xs font-semibold text-gray-500 mb-1">
                    File URL
                  </label>
                  <input
                    disabled={disabled}
                    value={item.file_url}
                    placeholder="https://file.pdf"
                    className="border rounded p-3 text-sm w-full"
                    onChange={(e) => {
                      setError(null);
                      onChange({
                        ...value,
                        items: items.map((i) =>
                          i.id === item.id
                            ? { ...i, file_url: e.target.value }
                            : i
                        ),
                      });
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      />
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
        className={`w-full border rounded p-3 text-sm flex justify-between items-center ${disabled
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
              className={`w-full text-left px-3 py-2 text-sm hover:bg-indigo-50 ${value === o.value
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
