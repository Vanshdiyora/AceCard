export default function MeetingSection({
  value,
  onChange,
  disabled = false,
}: {
  value: any;
  onChange: (v: any) => void;
  disabled?: boolean;
}) {
  return (
    <div className={`space-y-4 ${disabled ? "opacity-60 pointer-events-none" : ""}`}>
      <Toggle
        label="Enable meeting button"
        value={value.enabled}
        disabled={disabled}
        onChange={(v: boolean) =>
          onChange({ ...value, enabled: v })
        }
      />

      <select
        className="w-full border rounded-lg p-2"
        value={value.type}
        disabled={disabled}
        onChange={(e) =>
          onChange({ ...value, type: e.target.value })
        }
      >
        <option value="">Select type</option>
        <option value="calendly">Calendly</option>
        <option value="google">Google Meet</option>
        <option value="zoom">Zoom</option>
        <option value="custom">Custom</option>
      </select>

      <input
        placeholder="Meeting URL"
        value={value.meeting_url}
        disabled={disabled}
        onChange={(e) =>
          onChange({ ...value, meeting_url: e.target.value })
        }
        className="w-full border rounded-lg p-2"
      />

      <input
        placeholder="Button Text"
        value={value.button_text}
        disabled={disabled}
        onChange={(e) =>
          onChange({ ...value, button_text: e.target.value })
        }
        className="w-full border rounded-lg p-2"
      />
    </div>
  );
}

/* ================= TOGGLE ================= */

function Toggle({
  label,
  value,
  onChange,
  disabled = false,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <label className={`flex items-center gap-3 ${disabled ? "text-gray-400" : ""}`}>
      <span>{label}</span>
      <input
        type="checkbox"
        checked={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className={disabled ? "cursor-not-allowed" : ""}
      />
    </label>
  );
}
