import { useState, useEffect } from "react";
import { resolveTheme, EditModal } from "../MobilePublicSettings";
import { Pencil } from "lucide-react";

type Meeting = {
  button_text?: string;
  meeting_url?: string;
};

type Props = {
  meeting?: Meeting;
  theme: any;
  shapeClass?: string;
  onMeetingChange: (updater: any) => void;
  editable?: boolean;
  autoOpen?: boolean;
};

export function EditableMeetingCTA({
  meeting,
  theme,
  shapeClass = "",
  onMeetingChange,
  editable = true,
  autoOpen = false,
}: Props) {
  const t = resolveTheme(theme);

  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [draft, setDraft] = useState<{
    button_text: string;
    meeting_url: string;
  } | null>(null);

  useEffect(() => {
    if (autoOpen) setIsEditing(true);
  }, [autoOpen]);

  useEffect(() => {
    if (!isEditing) return;

    setDraft({
      button_text: meeting?.button_text || "",
      meeting_url: meeting?.meeting_url || "",
    });
  }, [isEditing, meeting]);

  const isValidUrl = (url: string) => {
    if (!url || !url.trim()) return false;
    try {
      const parsed = new URL(url.trim());
      return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
      return false;
    }
  };

  const saveMeeting = () => {
    if (!draft) return;

    if (!draft.meeting_url.trim()) {
      setError("Please enter a meeting URL.");
      return;
    }

    if (!isValidUrl(draft.meeting_url)) {
      setError(
        "Meeting URL is invalid. Make sure it starts with https:// or http:// "
      );
      return;
    }

    setError(null);

    onMeetingChange((prev: any) => ({
      ...prev,
      meeting: {
        ...prev?.meeting,
        button_text: draft.button_text,
        meeting_url: draft.meeting_url,
      },
    }));

    setIsEditing(false);
    setDraft(null);
  };

  return (
    <div className="relative">
      {editable && (
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          className="absolute top-2 right-0 z-20 h-9 w-9 rounded-full shadow
                     flex items-center justify-center transition hover:scale-105
                     bg-orange-500 text-white"
        >
          <Pencil size={16} />
        </button>
      )}

      {/* ✅ FIXED: Proper anchor tag */}
      <a
        href={meeting?.meeting_url || "#"}
        target="_blank"
        rel="noopener noreferrer"
        className={`block text-center py-4 text-sm font-semibold shadow-md ${shapeClass}`}
        style={{ backgroundColor: t.buttonBg, color: t.buttonText }}
      >
        {meeting?.button_text || "BOOK A MEETING NOW!"}
      </a>

      <EditModal
        open={isEditing}
        errorMessage={error}
        onClose={() => {
          setError(null);
          setIsEditing(false);
          setDraft(null);
        }}
        onSave={saveMeeting}
      >
        <h3 className="text-lg font-semibold">Edit Meeting Button</h3>

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
                className={`w-full border rounded-lg p-2 text-sm ${
                  error ? "border-red-400 focus:ring-red-400" : ""
                }`}
                placeholder="https://calendly.com/your-link"
                value={draft.meeting_url}
                onChange={(e) => {
                  setError(null);
                  setDraft((d) =>
                    d ? { ...d, meeting_url: e.target.value } : d
                  );
                }}
              />
            </div>
          </div>
        )}
      </EditModal>
    </div>
  );
}