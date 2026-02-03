import { useState, useEffect } from "react";
import { resolveTheme } from "../MobilePublicSettings";
import { Pencil } from "lucide-react";

export function EditableMeetingCTA({
  meeting,
  theme,
  shapeClass,
  onMeetingChange,
  editable = true, // 👈 allow lock control
}: any) {

  const t = resolveTheme(theme);

  const [isEditing, setIsEditing] = useState(false);
  const [draftText, setDraftText] = useState("");
  const [draftUrl, setDraftUrl] = useState("");

  // sync when parent changes
  useEffect(() => {
    setDraftText(meeting?.button_text || "");
    setDraftUrl(meeting?.meeting_url || "");
  }, [meeting]);

  const saveMeeting = () => {
    onMeetingChange((prev: any) => ({
      ...prev,
      meeting: {
        ...prev.meeting,
        button_text: draftText,
        meeting_url: draftUrl,
      },
    }));
    setIsEditing(false);
  };

  return (
    <div className="px-12 relative">
      {/* ✏️ EDIT ICON */}
      {/* ROUND EDIT ICON */}
      {editable !== false && (
        <button
          onClick={() => setIsEditing(true)}
          className="absolute -top-2 right-2 z-20 h-9 w-9 rounded-full shadow
      flex items-center justify-center transition hover:scale-105
      bg-orange-500 text-white"
          title="Edit"
        >
          <Pencil size={16} />
        </button>
      )}

      <a
        href={meeting?.meeting_url}
        className={`block text-center py-4 text-sm font-semibold shadow-md ${shapeClass}`}
        style={{ backgroundColor: t.buttonBg, color: t.buttonText }}
      >
        {meeting?.button_text || "BOOK A MEETING NOW!"}
      </a>

      {/* -------- EDIT MODAL -------- */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-80 p-4 space-y-4">
            <h3 className="font-semibold text-lg">Edit Meeting Button</h3>

            <input
              className="w-full border rounded-xl p-2 text-sm"
              placeholder="Button Text"
              value={draftText}
              onChange={(e) => setDraftText(e.target.value)}
            />

            <input
              className="w-full border rounded-xl p-2 text-sm"
              placeholder="Meeting URL"
              value={draftUrl}
              onChange={(e) => setDraftUrl(e.target.value)}
            />

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setIsEditing(false)}
                className="flex-1 border rounded-xl p-2"
              >
                Cancel
              </button>
              <button
                onClick={saveMeeting}
                className="flex-1 bg-indigo-600 text-white rounded-xl p-2"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
