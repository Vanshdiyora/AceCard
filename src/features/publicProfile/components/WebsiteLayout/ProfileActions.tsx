import { saveContact } from "../MobileWebsite";

export function ProfileActions({ user, theme, onConnect }: any) {
  return (
    <div className="grid grid-cols-2 gap-3 mt-4">
      <button
        onClick={() => saveContact(user)}
        className="h-11 rounded-xl border text-sm"
        style={{ color: theme.text_color, borderColor: theme.accent_color }}
      >
        Save Contact
      </button>

      <button
        onClick={onConnect}
        className="h-11 rounded-xl text-sm font-medium"
        style={{
          backgroundColor: theme.card_color,
          color: theme.primary_color,
        }}
      >
        Connect
      </button>
    </div>
  );
}
