import { createPortal } from "react-dom";
import VideoGallerySection from "../sections/VideoGallerySection";
import { useState, useEffect } from "react";

export function VideoGalleryEditModal({
  open,
  value,
  onClose,
  onSave,
  disabled,
}: any) {
  const [draft, setDraft] = useState(value);

  // keep in sync when opening
  useEffect(() => {
    if (open) setDraft(value);
  }, [open, value]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center">
      <div className="w-[95%] max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-xl p-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Edit Video Gallery</h3>
          <button onClick={onClose}>✕</button>
        </div>

        <VideoGallerySection
          value={draft}
          disabled={disabled}
          onChange={(v: any) => setDraft(v)}   // 👈 LOCAL edits
        />

        <div className="pt-4 flex gap-3">
          <button
            onClick={() => {
              onSave(draft);   // 👈 commit once
              onClose();
            }}
            className="flex-1 py-2 rounded-xl bg-purple-600 text-white"
          >
            Save
          </button>

          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-xl border"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
