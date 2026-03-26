import { saveContact, resolveShape } from "../../MobilePublicSettings";
import { Pencil } from "lucide-react";

export function ProfileActions({
  user,
  theme,
  contact,
  onConnect,
  layout,
  editable = false,
  onEdit, // 🔥 triggers central contact modal
}: any) {
  const shapeClass = resolveShape(layout?.button_style);

  return (
    <div className="relative mt-4">
      {/* EDIT BUTTON */}
      {editable && (
        <button
          onClick={() => onEdit?.()}
          className="absolute -top-4 -right-0 z-20 h-9 w-9 rounded-full shadow
            flex items-center justify-center bg-orange-500 text-white
            hover:scale-105 active:scale-95 transition"
        >
          <Pencil size={16} />
        </button>
      )}

      {/* ACTION BUTTONS */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => saveContact(user)}
          className={`h-11 border text-sm font-medium ${shapeClass}`}
          style={{
            color: theme.card_text || "#000000",
            borderColor: theme.button_color || "#FDBA74",
          }}
        >
          {contact?.contact_title || "Save Contact"}
        </button>

        <button
          onClick={() => onConnect?.()}
          className={`h-11 text-sm font-semibold shadow-md ${shapeClass}`}
          style={{
            backgroundColor: theme.button_color || "#FDBA74",
            color: theme.button_text || "#5F29F5",
          }}
        >
          {contact?.connect_title || "Connect"}
        </button>
      </div>
    </div>
  );
}