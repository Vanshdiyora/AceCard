import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Link2, FileText, Pencil } from "lucide-react";
import LinksFilesSection from "../../../../teams/components/details/publicProfile/sections/LinksFilesSection";
import { Section, resolveTheme } from "../MobilePublicSettings";

export default function Links({
  items = [],
  theme,
  editable = false,
  onChange,
}: any) {
  if (!items?.length && !editable) return null;

  const t = resolveTheme(theme);

  const [open, setOpen] = useState(false);
  const [buffer, setBuffer] = useState<any[]>([]);

  // sync when parent changes (only when modal is closed)
  useEffect(() => {
    if (!open) setBuffer(items || []);
  }, [items, open]);

  return (
    <Section
      title={
        <div className="flex items-center justify-between w-full">
          <span>Links & Files</span>

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
        {items
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

      {/* MODAL EDITOR */}
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

/* ================= MODAL ================= */

function LinksFilesModal({
  open,
  buffer,
  setBuffer,
  onClose,
  onSave,
}: any) {
  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center px-3">
      <div
        className="bg-white w-full max-w-md rounded-2xl p-4 shadow-xl
                   max-h-[85vh] flex flex-col animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-base font-semibold mb-3">Edit Links & Files</h3>

        <div className="flex-1 overflow-y-auto">
          <LinksFilesSection
            value={{ items: buffer }}
            onChange={(v) => setBuffer(v.items)}
          />
        </div>

        <div className="flex gap-3 mt-4">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-xl border text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>

          <button
            onClick={onSave}
            className="flex-1 py-2 rounded-xl bg-green-500
                       text-white font-semibold hover:bg-green-600"
          >
            Save
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
