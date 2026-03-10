import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Link2, FileText, Pencil, Upload } from "lucide-react";
import { Section, resolveTheme } from "../MobilePublicSettings";

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
  if (!items?.length && !editable) return null;

  const t = resolveTheme(theme);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (autoOpen) setOpen(true);
  }, [autoOpen]);

  const [buffer, setBuffer] = useState({
    section_title: title || "Links & Files",
    items: [],
  });

  useEffect(() => {
    if (!open) {
      setBuffer({
        section_title: title || "Links & Files",
        items: items || [],
      });
    }
  }, [items, title, open]);

  return (
    <Section
      title={
        <div className="flex items-center justify-between w-full">
          <span>{buffer.section_title}</span>

          {editable && (
            <button
              onClick={() => setOpen(true)}
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
        {buffer.items
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

  /* =========================
     HANDLE AVATAR UPLOAD
  ========================== */
  const handleAvatarUpload = (file: File, index: number) => {
    const url = URL.createObjectURL(file);

    setBuffer((prev: any) => {
      const updated = [...prev.items];
      updated[index] = {
        ...updated[index],
        avatar_url: url,
      };

      return {
        ...prev,
        items: updated,
      };
    });
  };

  /* =========================
     VALIDATION
  ========================== */
  const validate = () => {
    if (!buffer.items.length) {
      setError("Please add at least one link or file.");
      return false;
    }

    for (const item of buffer.items) {
      if (!item.title?.trim()) {
        setError("Each link must have a title.");
        return false;
      }

      if (item.type === "link" && !item.url) {
        setError(`${item.title} is missing URL`);
        return false;
      }

      if (item.type === "file" && !item.file_url) {
        setError(`${item.title} is missing file`);
        return false;
      }
    }

    setError(null);
    return true;
  };

  /* LOCK SCROLL */
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
          className="absolute right-3 top-3 h-8 w-8 rounded-full flex items-center justify-center
          text-gray-400 hover:text-gray-700 hover:bg-gray-100"
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
            <p className="text-xs text-gray-500 uppercase">Section title</p>
            <input
              value={buffer.section_title}
              onChange={(e) =>
                setBuffer((p: any) => ({
                  ...p,
                  section_title: e.target.value,
                }))
              }
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
          </div>

          {/* ITEMS */}
          {buffer.items.map((item: any, i: number) => (
            <div key={i} className="border rounded-xl p-3 space-y-3">

              <div className="flex items-center gap-3">

                {/* AVATAR */}
                <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                  {item.avatar_url ? (
                    <img
                      src={item.avatar_url}
                      className="h-full w-full object-cover"
                    />
                  ) : item.type === "file" ? (
                    <FileText size={16} />
                  ) : (
                    <Link2 size={16} />
                  )}
                </div>

                {/* UPLOAD */}
                <label className="cursor-pointer text-xs text-purple-600 flex items-center gap-1">
                  <Upload size={14} />
                  {item.avatar_url ? "Update Icon" : "Upload Icon"}

                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleAvatarUpload(file, i);
                    }}
                  />
                </label>
              </div>

              {/* TITLE */}
              <input
                value={item.title}
                placeholder="Title"
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

              {/* URL */}
              {item.type === "link" && (
                <input
                  value={item.url}
                  placeholder="https://example.com"
                  onChange={(e) => {
                    const val = e.target.value;

                    setBuffer((prev: any) => {
                      const updated = [...prev.items];
                      updated[i] = { ...updated[i], url: val };

                      return { ...prev, items: updated };
                    });
                  }}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
              )}

              {/* FILE */}
              {item.type === "file" && (
                <input
                  value={item.file_url}
                  placeholder="File URL"
                  onChange={(e) => {
                    const val = e.target.value;

                    setBuffer((prev: any) => {
                      const updated = [...prev.items];
                      updated[i] = { ...updated[i], file_url: val };

                      return { ...prev, items: updated };
                    });
                  }}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
              )}
            </div>
          ))}

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