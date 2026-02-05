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

  // 🔒 lock background scroll
useEffect(() => {
  if (!open) {
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.left = "";
    document.body.style.right = "";
    document.body.style.width = "";
    document.body.style.overflow = "";
    return;
  }

  // lock body (iOS-safe)
  const scrollY = window.scrollY;

  document.body.style.position = "fixed";
  document.body.style.top = `-${scrollY}px`;
  document.body.style.left = "0";
  document.body.style.right = "0";
  document.body.style.width = "100%";
  document.body.style.overflow = "hidden";

  return () => {
    const y = document.body.style.top;

    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.left = "";
    document.body.style.right = "";
    document.body.style.width = "";
    document.body.style.overflow = "";

    window.scrollTo(0, Math.abs(parseInt(y || "0", 10)));
  };
}, [open]);


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
          onChange={(v: any) => setDraft(v)} // local edits
        />

        <div className="pt-4 flex gap-3">
          <button
            onClick={() => {
              onSave(draft);
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
