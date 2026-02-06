import { useState, useEffect } from "react";
import { resolveTheme } from "../MobilePublicSettings";
import { Pencil } from "lucide-react";
import { EditModal } from "../MobilePublicSettings";

export function EditableMeetingCTA({
  meeting,
  theme,
  shapeClass,
  onMeetingChange,
  editable = true,
}: any) {
  const t = resolveTheme(theme);

  const [isEditing, setIsEditing] = useState(false);

  // 🔥 local draft
  const [draft, setDraft] = useState<{
    button_text: string;
    meeting_url: string;
  } | null>(null);

  // initialize draft ONLY when opening
  useEffect(() => {
    if (!isEditing) return;

    setDraft({
      button_text: meeting?.button_text || "",
      meeting_url: meeting?.meeting_url || "",
    });
  }, [isEditing, meeting]);

  const saveMeeting = () => {
    if (!draft) return;

    onMeetingChange((prev: any) => ({
      ...prev,
      meeting: {
        ...prev.meeting,
        button_text: draft.button_text,
        meeting_url: draft.meeting_url,
      },
    }));

    setIsEditing(false);
    setDraft(null);
  };

  return (
    <div className="px-12 relative">
      {/* ✏️ EDIT ICON */}
      {editable && (
        <button
          onClick={() => setIsEditing(true)}
          className="absolute top-2 right-0 z-20 h-9 w-9 rounded-full shadow
                     flex items-center justify-center transition hover:scale-105
                     bg-orange-500 text-white"
        >
          <Pencil size={16} />
        </button>
      )}

      {/* CTA BUTTON */}
      <a
        href={meeting?.meeting_url}
        className={`block text-center py-4 text-sm font-semibold shadow-md ${shapeClass}`}
        style={{ backgroundColor: t.buttonBg, color: t.buttonText }}
      >
        {meeting?.button_text || "BOOK A MEETING NOW!"}
      </a>

      {/* -------- EDIT MODAL -------- */}
      <EditModal
        open={isEditing}
        onClose={() => setIsEditing(false)}   // ❌ discard
        onSave={saveMeeting}                  // ✅ commit
      >
        <h3 className="text-lg font-semibold">
          Edit Meeting Button
        </h3>

        {draft && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Button Text
              </label>
              <input
                className="w-full border rounded-lg p-2 text-sm"
                placeholder="e.g. Book a call"
                value={draft.button_text}
                onChange={(e) =>
                  setDraft((d) =>
                    d ? { ...d, button_text: e.target.value } : d
                  )
                }
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Meeting URL
              </label>
              <input
                className="w-full border rounded-lg p-2 text-sm"
                placeholder="https://calendly.com/your-link"
                value={draft.meeting_url}
                onChange={(e) =>
                  setDraft((d) =>
                    d ? { ...d, meeting_url: e.target.value } : d
                  )
                }
              />
            </div>
          </div>
        )}
      </EditModal>
    </div>
  );
}
