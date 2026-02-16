import { createPortal } from "react-dom";
import { Plus, Check } from "lucide-react";

const ALL_SECTIONS = [
  { id: "products", label: "Products" },
  { id: "photo_gallery", label: "Photo Gallery" },
  { id: "youtube", label: "Videos" },
  { id: "links_files", label: "Links & Files" },
  { id: "meeting", label: "Meeting Button" },
  { id: "banner", label: "Banner" },
  { id: "social_links", label: "Social Links" },
  { id: "contact", label: "Contact" },
  { id: "about", label: "About" },
];

export default function AddSectionModal({
  open,
  sections,
  onClose,
  onAdd,
}: any) {
  if (!open) return null;

  const enabledIds = new Set(
    sections.filter((s: any) => s.enabled).map((s: any) => s.type)
  );

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-black/40 flex items-center justify-center px-3">
      <div className="bg-white w-full sm:max-w-3xl max-h-[90vh] rounded-2xl p-4 sm:p-6 shadow-xl flex flex-col overflow-hidden">
        <div className="flex justify-between items-center mb-4 border-b pb-2">
          <h3 className="text-lg font-semibold">Add Section</h3>
          <button onClick={onClose}>✕</button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 overflow-y-auto">
          {ALL_SECTIONS.map((s) => {
            const added = enabledIds.has(s.id);

            return (
              <button
                key={s.id}
                onClick={() => onAdd(s.id)}
                className={`flex items-center justify-between px-3 py-3 rounded-xl border transition text-sm
                  ${
                    added
                      ? "bg-purple-50 border-purple-500 text-purple-700"
                      : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                  }`}
              >
                <span>{s.label}</span>

                <div
                  className={`h-7 w-7 flex items-center justify-center rounded-full border
                    ${
                      added
                        ? "bg-purple-600 border-purple-600 text-white"
                        : "border-gray-300"
                    }`}
                >
                  {added ? <Check size={14} /> : <Plus size={14} />}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>,
    document.body
  );
}
