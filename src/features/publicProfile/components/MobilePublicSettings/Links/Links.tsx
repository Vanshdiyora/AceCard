import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Link2, FileText, Pencil } from "lucide-react";
import LinksFilesSection from "../../../../teams/components/details/publicProfile/sections/LinksFilesSection";
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
  autoOpen = false,   // ✅ ADD THIS
}: any) {
  if (!items?.length && !editable) return null;

  const t = resolveTheme(theme);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (autoOpen) {
      setOpen(true);
    }
  }, [autoOpen]);
  // ✅ buffer is OBJECT, not array
  const [buffer, setBuffer] = useState<{
    section_title: string;
    items: any[];
  }>({
    section_title: title || "Links & Files",
    items: [],
  });

  /* sync from parent ONLY when modal closed */
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
              title="Edit"
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
          .map((l: any) => (
            <a
              key={l.id}
              href={l.url || l.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-xl p-2 transition hover:scale-[1.01]"
            >
              <div
                className="h-9 w-9 rounded-full flex items-center justify-center shadow"
                style={{
                  backgroundColor: t.buttonBg,
                  color: t.buttonText,
                }}
              >
                {l.type === "file" ? (
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
          ))}
      </div>

      {/* MODAL */}
      <LinksFilesModal
        open={open}
        buffer={buffer}
        setBuffer={setBuffer}
        onClose={() => setOpen(false)}
        onSave={() => {
          onChange?.({
            section_title: buffer.section_title,
            items: buffer.items,
          });
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
}: {
  open: boolean;
  buffer: {
    section_title: string;
    items: any[];
  };
  setBuffer: (updater: any) => void;
  onClose: () => void;
  onSave: () => void;
}) {
  /* 🔒 Lock background scroll */
  useEffect(() => {
    if (!open) {
      document.body.style.cssText = "";
      return;
    }

    const scrollY = window.scrollY;

    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";
    document.body.style.overflow = "hidden";

    return () => {
      const y = document.body.style.top;
      document.body.style.cssText = "";
      window.scrollTo(0, parseInt(y || "0") * -1);
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div
      className="
        fixed inset-0 z-[9999]
        bg-black/50 backdrop-blur-sm
        flex items-center justify-center px-3
      "
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="
          relative bg-white w-full max-w-md
          rounded-2xl shadow-xl
          max-h-[85vh] flex flex-col
        "
      >
        {/* CLOSE */}
        <button
          onClick={onClose}
          className="absolute right-3 top-3 h-8 w-8
                     rounded-full flex items-center justify-center
                     text-gray-400 hover:text-gray-700 hover:bg-gray-100"
        >
          ✕
        </button>

        {/* HEADER */}
        <h3 className="text-base font-semibold px-4 pt-4 pb-2">
          Edit Links & Files
        </h3>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto px-4 space-y-4">
          {/* SECTION TITLE */}
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-wide text-gray-500">
              Section title
            </p>

            <input
              type="text"
              value={buffer.section_title}
              placeholder="Links & Files"
              onChange={(e) =>
                setBuffer((prev: any) => ({
                  ...prev,
                  section_title:
                    e.target.value.trim() === ""
                      ? "Links & Files"
                      : e.target.value,
                }))
              }
              className="
                w-full rounded-lg border px-3 py-2 text-sm
                focus:outline-none focus:ring-2 focus:ring-purple-500
              "
            />
          </div>

          {/* ITEMS EDITOR */}
          <LinksFilesSection
            value={{ items: buffer.items }}
            onChange={(v: any) =>
              setBuffer((prev: any) => ({
                ...prev,
                items: v.items,
              }))
            }
          />
        </div>

        {/* FOOTER */}
        <div className="border-t p-4 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-xl border
                       text-gray-600 font-semibold hover:bg-gray-50"
          >
            Cancel
          </button>

          <button
            onClick={onSave}
            className="flex-1 py-2 rounded-xl
                       bg-purple-600 text-white font-semibold
                       hover:bg-purple-500"
          >
            Save
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
