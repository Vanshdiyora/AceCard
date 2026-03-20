import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Link2, FileText, Pencil, Upload, Trash2 } from "lucide-react";
import { Section, resolveTheme } from "../MobilePublicSettings";
import CommonItemsReorder from "../../../../settings/components/vice/sections/CommonItemsReorder";
import { uploadImage } from "../../../services/publicProfile.api";

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

/* ============================================================
   LINKS SECTION (PREVIEW + EDIT)
============================================================ */
export default function Links({
  title,
  items = [],
  theme,
  editable = false,
  onChange,
  autoOpen = false,
}: any) {
  const t = resolveTheme(theme);
  const showSection = Boolean(items?.length) || editable;
  const initialBuffer = {
    section_title: title || "Links & Files",
    items: items || [],
  };

  const [open, setOpen] = useState(Boolean(autoOpen));

  const [buffer, setBuffer] = useState({
    section_title: initialBuffer.section_title,
    items: initialBuffer.items as any[],
  });

  const displayBuffer = open ? buffer : initialBuffer;

  if (!showSection) return null;

  return (
    <Section
      title={
        <div className="flex items-center justify-between w-full">
          <span>{displayBuffer.section_title}</span>

          {editable && (
            <button
              onClick={() => {
                setBuffer(initialBuffer);
                setOpen(true);
              }}
              className="h-9 w-9 rounded-full flex items-center justify-center
              shadow transition hover:scale-105
              bg-orange-500 text-white"
            >
              <Pencil size={16} />
            </button>
          )}
        </div>
      }
      theme={theme}
    >
      {/* PREVIEW */}
      <div className="mt-3 flex flex-col gap-4">
        {displayBuffer.items
          .filter((l: any) => l.enabled !== false)
          .sort((a: any, b: any) => (a.rank ?? 0) - (b.rank ?? 0))
          .map((l: any) => {
            const href = l.type === "file" ? l.file_url : l.url;

            return (
              <a
                key={l.id}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-xl p-2 transition hover:scale-[1.01]"
              >
                <div
                  className="h-9 w-9 rounded-full flex items-center justify-center shadow overflow-hidden"
                  style={{
                    backgroundColor: t.buttonBg,
                    color: t.buttonText,
                  }}
                >
                  {l.avatar_url ? (
                    <img
                      src={l.avatar_url}
                      className="h-full w-full object-cover"
                    />
                  ) : l.type === "file" ? (
                    <FileText size={16} />
                  ) : (
                    <Link2 size={16} />
                  )}
                </div>

                <p
                  className="text-sm font-semibold truncate"
                  style={{ color: t.text }}
                >
                  {l.title || "Untitled"}
                </p>
              </a>
            );
          })}
      </div>

      <LinksFilesModal
        open={open}
        buffer={buffer}
        setBuffer={setBuffer}
        onClose={() => setOpen(false)}
        onSave={() => {
          onChange?.(buffer);
          setOpen(false);
        }}
      />
    </Section>
  );
}

/* ============================================================
   MODAL
============================================================ */
function LinksFilesModal({
  open,
  buffer,
  setBuffer,
  onClose,
  onSave,
}: any) {

  const [error, setError] = useState<string | null>(null);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

  /* ================= ICON UPLOAD ================= */

  const handleAvatarUpload = (file: File, index: number) => {
    const url = URL.createObjectURL(file);

    setBuffer((prev: any) => {
      const updated = [...prev.items];
      updated[index] = {
        ...updated[index],
        avatar_url: url,
      };

      return { ...prev, items: updated };
    });
  };

  /* ================= FILE UPLOAD ================= */

  const handleFileUpload = async (file: File, index: number) => {
    try {

      if (file.size > MAX_FILE_SIZE) {
        setError("File size must be less than 20 MB.");
        return;
      }

      setUploadingIndex(index);
      setError(null);

      const form = new FormData();
      form.append("file", file);

      const res = await uploadImage(file); // your API
      const url = res?.data?.url;

      setBuffer((prev: any) => {
        const updated = [...prev.items];
        updated[index] = {
          ...updated[index],
          file_url: url,
        };

        return { ...prev, items: updated };
      });

    } catch {
      setError("File upload failed.");
    } finally {
      setUploadingIndex(null);
    }
  };

  /* ================= VALIDATION ================= */

  const validate = () => {
    if (!buffer.items.length) {
      setError("Please add at least one link or file.");
      return false;
    }

    for (const item of buffer.items) {
      if (!item.title?.trim()) {
        setError("Each item must have a title.");
        return false;
      }

      if (item.type === "link") {
        const url = item.url?.trim();

        if (!url) {
          setError(`${item.title} is missing URL`);
          return false;
        }

        if (!/^https?:\/\//i.test(url)) {
          setError(`${item.title}'s link must start with http:// or https://`);
          return false;
        }
      }

      if (item.type === "file") {
        const fileUrl = item.file_url?.trim();

        if (!fileUrl) {
          setError(`${item.title} is missing file`);
          return false;
        }

        if (!/^https?:\/\//i.test(fileUrl)) {
          setError(`${item.title} has invalid file URL`);
          return false;
        }
      }
    }

    setError(null);
    return true;
  };

  /* ================= PREVENT ADD IF INVALID ================= */

  const validateExistingRows = () => {
    for (const item of buffer.items) {

      if (!item.title?.trim()) {
        setError("Please enter title before adding another item.");
        return false;
      }

      if (item.type === "link" && !item.url?.trim()) {
        setError("Link item missing URL.");
        return false;
      }

      if (item.type === "file" && !item.file_url) {
        setError("File item missing uploaded file.");
        return false;
      }
    }

    setError(null);
    return true;
  };

  /* ================= LOCK BODY SCROLL ================= */

  useEffect(() => {

    if (!open) return;

    const scrollY = window.scrollY;

    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;

    return () => {
      const y = document.body.style.top;
      document.body.style.cssText = "";
      window.scrollTo(0, parseInt(y || "0") * -1);
    };

  }, [open]);

  if (!open) return null;

  return createPortal(

    <div
      className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center px-3"
      onClick={onClose}
    >

      <div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white w-full max-w-md rounded-2xl shadow-xl max-h-[85vh] flex flex-col"
      >

        {/* CLOSE */}
        <button
          onClick={onClose}
          className="absolute right-3 top-3 h-8 w-8 rounded-full flex items-center justify-center hover:bg-gray-100"
        >
          ✕
        </button>

        <h3 className="text-base font-semibold px-4 pt-4 pb-2">
          Edit Links & Files
        </h3>

        {/* BODY */}

        <div className="flex-1 overflow-y-auto px-4 space-y-6">

          {/* SECTION TITLE */}

          <div>
            <p className="text-xs text-gray-500 uppercase mb-1">
              Section Title
            </p>

            <input
              value={buffer.section_title}
              onChange={(e) =>
                setBuffer((p: any) => ({
                  ...p,
                  section_title: e.target.value,
                }))
              }
              className="w-full border rounded-lg px-3 py-2 text-sm"
              placeholder="Enter a section title"
            />
          </div>

          {/* ITEMS */}

          <CommonItemsReorder
            items={buffer.items.map((item: any) => ({
              ...item,
              id: item.id,
            }))}
            onChange={(updated: any[]) =>
              setBuffer((prev: any) => ({
                ...prev,
                items: updated.map((i, idx) => ({
                  ...i,
                  rank: idx + 1,
                })),
              }))
            }
            renderItem={(item: any, i: number) => (

              <div className="border rounded-xl p-3 space-y-3">

                {/* HEADER */}

                <div className="flex justify-between">

                  <span className="text-xs font-semibold text-gray-500">
                    Item {i + 1}
                  </span>

                  <button
                    onClick={() =>
                      setBuffer((prev: any) => ({
                        ...prev,
                        items: prev.items.filter((_: any, idx: number) => idx !== i),
                      }))
                    }
                    className="text-red-500"
                  >
                    <Trash2 size={16} />
                  </button>

                </div>

                {/* ICON */}

                <div className="flex items-center gap-3">

                  <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                    {item.avatar_url
                      ? <img src={item.avatar_url} className="w-full h-full object-cover" />
                      : item.type === "file"
                        ? <FileText size={16} />
                        : <Link2 size={16} />
                    }
                  </div>

                  <label className="cursor-pointer text-xs text-purple-600 flex items-center gap-1">

                    <Upload size={14} />
                    {item.avatar_url ? "Update Icon" : "Upload Icon"}

                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;

                        handleAvatarUpload(file, i);
                        e.target.value = "";
                      }}
                    />

                  </label>

                </div>

                {/* TITLE */}

                <div>
                  <p className="text-xs text-gray-500 uppercase mb-1">
                    Title
                  </p>

                  <input
                    value={item.title}
                    placeholder="Enter a title"
                    onChange={(e) => {
                      const val = e.target.value;

                      setBuffer((prev: any) => {
                        const updated = [...prev.items];
                        updated[i] = { ...updated[i], title: val };
                        return { ...prev, items: updated };
                      });
                    }}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  />

                </div>
                {/* LINK */}

                {item.type === "link" && (

                  <div>
                    <p className="text-xs text-gray-500 uppercase mb-1">
                      Link URL
                    </p>

                    <input
                      value={item.url}
                      placeholder="Enter an URL"
                      onChange={(e) => {
                        let url = e.target.value ?? "";

                        const looksLikeDomain =
                          /^[a-zA-Z0-9.-]+\.[a-zA-Z]{1,}(\/.*)?$/.test(url.trim());

                        if (
                          url.trim() !== "" &&
                          !url.startsWith("http://") &&
                          !url.startsWith("https://") &&
                          looksLikeDomain
                        ) {
                          url = "https://" + url.trim();
                        }

                        setBuffer((prev: any) => {
                          const updated = [...prev.items];
                          updated[i] = { ...updated[i], url };
                          return { ...prev, items: updated };
                        });
                      }}
                      className="w-full border rounded-lg px-3 py-2 text-sm"
                    />
                  </div>

                )}

                {/* FILE */}

                {item.type === "file" && (

                  <div>

                    <label className="cursor-pointer text-sm text-purple-600 flex items-center gap-2">

                      <Upload size={16} />

                      {uploadingIndex === i
                        ? "Uploading..."
                        : item.file_url
                          ? "Replace File"
                          : "Upload File"
                      }

                      <input
                        type="file"
                        hidden
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;

                          handleFileUpload(file, i);
                          e.target.value = "";
                        }}
                      />

                    </label>

                    {item.file_url && (
                      <p className="text-xs text-gray-400 mt-1">
                        File uploaded
                      </p>
                    )}

                  </div>

                )}

              </div>

            )}
          />

          {/* ADD BUTTONS */}

          <div className="flex gap-3 pb-2">

            <button
              onClick={() => {

                if (!validateExistingRows()) return;

                setBuffer((prev: any) => ({
                  ...prev,
                  items: [
                    ...prev.items,
                    {
                      id: crypto.randomUUID(),
                      title: "",
                      type: "link",
                      url: "",
                      enabled: true,
                      rank: prev.items.length + 1
                    }
                  ]
                }));

              }}
              className="flex-1 border rounded-lg py-2 text-sm"
            >
              + Add Link
            </button>

            <button
              onClick={() => {

                if (!validateExistingRows()) return;

                setBuffer((prev: any) => ({
                  ...prev,
                  items: [
                    ...prev.items,
                    {
                      id: crypto.randomUUID(),
                      title: "",
                      type: "file",
                      file_url: "",
                      enabled: true,
                      rank: prev.items.length + 1
                    }
                  ]
                }));

              }}
              className="flex-1 border rounded-lg py-2 text-sm"
            >
              + Add File
            </button>

          </div>

        </div>

        {/* FOOTER */}

        <div className="border-t bg-white">

          {error && (
            <div className="px-4 pt-3 text-sm text-red-500">
              {error}
            </div>
          )}

          <div className="p-4 flex gap-3">

            <button
              onClick={onClose}
              className="flex-1 border rounded-xl py-2.5"
            >
              Cancel
            </button>

            <button
              onClick={() => {
                if (!validate()) return;
                onSave();
              }}
              className="flex-1 bg-purple-600 text-white rounded-xl py-2.5"
            >
              Save
            </button>

          </div>

        </div>

      </div>

    </div>,

    document.body
  );
}