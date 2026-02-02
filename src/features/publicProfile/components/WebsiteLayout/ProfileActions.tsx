import { saveContact, resolveShape } from "../MobileWebsite";

export function ProfileActions({
  user,
  theme,
  contact,
  onConnect,
  layout
}: any) {
  const shapeClass = resolveShape(layout?.button_style);
  return (
    <div className="grid grid-cols-2 gap-3 mt-4">
      <button
        onClick={() => saveContact(user)}
        className={`h-11 border text-sm font-medium ${shapeClass}`}
        style={{
          color: theme.card_text,
          borderColor: theme.button_color,
        }}
      >
        {contact?.contact_title || "Save Contact"}
      </button>

      <button
        onClick={() => onConnect?.()}

        className={`h-11 text-sm font-semibold shadow-md ${shapeClass}`}
        style={{
          backgroundColor: theme.button_color,
          color: theme.button_text,
        }}
      >
        {contact?.connect_title || "Connect"}
      </button>
    </div>

  );
}
