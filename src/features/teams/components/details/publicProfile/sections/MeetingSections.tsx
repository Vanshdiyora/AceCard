export default function MeetingSection({
  value,
  onChange,
}: {
  value: any;
  onChange: (v: any) => void;
}) {
  return (
    <div className="space-y-4">
      <Toggle
        label="Enable meeting button"
        value={value.enabled}
        onChange={(v: any) => onChange({ ...value, enabled: v })}
      />

      <select
        className="w-full border rounded-lg p-2"
        value={value.type}
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
        onChange={(e) =>
          onChange({ ...value, meeting_url: e.target.value })
        }
        className="w-full border rounded-lg p-2"
      />

      <input
        placeholder="Button Text"
        value={value.button_text}
        onChange={(e) =>
          onChange({ ...value, button_text: e.target.value })
        }
        className="w-full border rounded-lg p-2"
      />
    </div>
  );
}

function Toggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-3">
      <span>{label}</span>
      <input
        type="checkbox"
        checked={value}
        onChange={(e) => onChange(e.target.checked)}
      />
    </label>
  );
}
