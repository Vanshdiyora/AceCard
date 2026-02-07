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
    <div
      className={`space-y-4 ${
        disabled ? "opacity-60 pointer-events-none" : ""
      }`}
    >
      {/* ENABLE */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-gray-700">
          Enable meeting button
        </span>

        <Toggle
          label=""
          value={value.enabled}
          disabled={disabled}
          onChange={(v: boolean) =>
            onChange({ ...value, enabled: v })
          }
        />
      </div>

      {/* MEETING URL */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-1">
          Meeting URL
        </p>
        <input
          placeholder="https://example.com"
          value={value.meeting_url}
          disabled={disabled}
          onChange={(e) =>
            onChange({ ...value, meeting_url: e.target.value })
          }
          className="w-full border rounded-lg p-2"
        />
      </div>

      {/* BUTTON TEXT */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-1">
          Button Text
        </p>
        <input
          placeholder="Book a call"
          value={value.button_text}
          disabled={disabled}
          onChange={(e) =>
            onChange({ ...value, button_text: e.target.value })
          }
          className="w-full border rounded-lg p-2"
        />
      </div>
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
    <label
      className={`flex items-center gap-3 ${
        disabled ? "text-gray-400 cursor-not-allowed" : ""
      }`}
    >
      {label && <span>{label}</span>}
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
