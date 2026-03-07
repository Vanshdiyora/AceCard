import { ChevronDown } from "lucide-react";
import CommonItemsReorder from "./CommonItemsReorder";
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { uploadImage } from "../../../../publicProfile/services/publicProfile.api";

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
  value: {
    section_title?: string;
    items: Item[];
  };

  onChange: (v: {
    section_title?: string;
    items: Item[];
  }) => void;
  disabled?: boolean;
}) {
  const items = [...value.items].sort((a, b) => a.rank - b.rank);
  const [error, setError] = useState<string | null>(null);

  /* ================= ADD ================= */
  const handleFileUpload = async (file: File, itemId: string) => {
    try {
      setError(null);

      const res = await uploadImage(file);

      const fileUrl = res?.data?.url;

      if (!fileUrl) throw new Error("Upload failed");

      const updatedItems = value.items.map((i) =>
        i.id === itemId
          ? {
            ...i,
            file_url: fileUrl,
            file_type: file.type,
          }
          : i
      );

      onChange({
        ...value,
        items: updatedItems,
      });
    } catch (err) {
      setError("File upload failed. Please try again.");
    }
  };

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
      {/* SECTION TITLE */}
      <div className="max-w-md">
        <label className="block text-xs font-semibold text-gray-500 mb-1">
          Section Title
        </label>

        <input
          disabled={disabled}
          value={value.section_title || ""}
          placeholder="e.g. Important Links"
          className="border rounded-xl p-3 text-sm w-full"
          onChange={(e) =>
            onChange({
              ...value,
              section_title: e.target.value,
            })
          }
        />
      </div>
      {/* ADD */}
      <div className="w-full sm:w-44">
        <button
          onClick={addItem}
          disabled={disabled}
          className={`w-full px-4 py-3 sm:py-2 rounded-lg text-white text-sm ${disabled
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
            items: reordered.map((i, idx) => ({
              ...i,
              rank: idx + 1,
            })),
          })
        }
        renderItem={(item: Item) => (
          <div className="relative bg-white border rounded-xl p-3 shadow-sm">

            {/* HEADER */}
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-gray-400">
                {item.type === "link" ? "Link" : "File"}
              </span>

              <button
                onClick={() => removeItem(item.id)}
                disabled={disabled}
                className={`font-bold ${disabled
                  ? "text-gray-300 cursor-not-allowed"
                  : "text-red-500 hover:text-red-700"
                  }`}
              >
                ✕
              </button>
            </div>

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
                  className="border rounded-xl p-3 text-sm w-full"
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

              {/* LINK */}
              {item.type === "link" && (
                <div className="md:col-span-7">
                  <label className="block text-xs font-semibold text-gray-500 mb-1">
                    Link URL
                  </label>
                  <input
                    disabled={disabled}
                    value={item.url}
                    placeholder="https://example.com"
                    className="border rounded-xl p-3 text-sm w-full"
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

              {/* FILE */}
              {item.type === "file" && (
                <div className="md:col-span-7">
                  <label className="block text-xs font-semibold text-gray-500 mb-1">
                    File URL
                  </label>
                  {!item.file_url ? (
                    /* UPLOAD UI */
                    <div
                      className={`border-2 border-dashed rounded-xl p-4 text-center transition
    ${disabled
                          ? "bg-gray-100 border-gray-200"
                          : "border-gray-300 hover:border-indigo-400 hover:bg-indigo-50/30"
                        }`}
                    >
                      <input
                        type="file"
                        disabled={disabled}
                        className="hidden"
                        id={`file-upload-${item.id}`}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file, item.id);
                          e.target.value = "";
                        }}
                      />

                      <label
                        htmlFor={`file-upload-${item.id}`}
                        className={`cursor-pointer flex flex-col items-center gap-1 text-sm
      ${disabled ? "text-gray-400" : "text-gray-600"}`}
                      >
                        <span className="font-medium text-indigo-600">
                          Click to upload
                        </span>
                        <span className="text-xs text-gray-400">
                          PDF, DOC, Images etc
                        </span>
                      </label>
                    </div>
                  ) : (
                    /* FILE PREVIEW UI */
                    <div className="flex items-center justify-between border rounded-xl px-3 py-3 bg-gray-50">
                      <div className="flex items-center gap-2 text-sm text-gray-700 truncate">
                        📄
                        <span className="truncate max-w-[200px]">
                          {item.file_url.split("/").pop()}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs">
                        <a
                          href={item.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:underline"
                        >
                          View
                        </a>

                        {!disabled && (
                          <>
                            <label
                              htmlFor={`file-upload-${item.id}`}
                              className="text-indigo-600 cursor-pointer hover:underline"
                            >
                              Replace
                            </label>

                            <button
                              onClick={() =>
                                onChange({
                                  ...value,
                                  items: value.items.map((i) =>
                                    i.id === item.id
                                      ? { ...i, file_url: "", file_type: "" }
                                      : i
                                  ),
                                })
                              }
                              className="text-red-500 hover:text-red-700"
                            >
                              Remove
                            </button>
                          </>
                        )}
                      </div>

                      <input
                        type="file"
                        className="hidden"
                        id={`file-upload-${item.id}`}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file, item.id);
                          e.target.value = "";
                        }}
                      />
                    </div>
                  )}
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
  const [coords, setCoords] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);

  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const options = [
    { value: "link", label: "Link" },
    { value: "file", label: "File" },
  ] as const;

  const current = options.find((o) => o.value === value);

  /* ================= OPEN ================= */

  const openDropdown = () => {
    if (!buttonRef.current) return;

    const rect = buttonRef.current.getBoundingClientRect();

    setCoords({
      top: rect.bottom + 4,
      left: rect.left,
      width: rect.width,
    });

    setOpen(true);
  };

  /* ================= CLOSE LOGIC ================= */

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;

      if (
        buttonRef.current?.contains(target) ||
        dropdownRef.current?.contains(target)
      ) {
        return;
      }

      setOpen(false);
    };

    const handleScroll = () => setOpen(false);
    const handleResize = () => setOpen(false);

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", handleResize);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleResize);
    };
  }, [open]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        onClick={() => !disabled && openDropdown()}
        className={`w-full border rounded-xl p-3 text-sm flex justify-between items-center ${disabled
          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
          : "bg-white hover:bg-gray-50"
          }`}
      >
        <span>{current?.label}</span>
        <ChevronDown className="w-4 h-4 text-gray-500" />
      </button>

      {open &&
        coords &&
        createPortal(
          <div
            ref={dropdownRef}
            style={{
              position: "fixed",
              top: coords.top,
              left: coords.left,
              width: coords.width,
              zIndex: 9999,
            }}
            className="bg-white border rounded-xl shadow-xl overflow-hidden"
          >
            {options.map((o, index) => (
              <button
                key={o.value}
                type="button"
                onClick={() => {
                  onChange(o.value);
                  setOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-sm transition ${value === o.value
                  ? "bg-indigo-100 font-semibold"
                  : "hover:bg-indigo-50"
                  } ${index === 0 ? "rounded-t-xl" : ""
                  } ${index === options.length - 1 ? "rounded-b-xl" : ""
                  }`}
              >
                {o.label}
              </button>
            ))}
          </div>,
          document.body
        )}
    </>
  );
}