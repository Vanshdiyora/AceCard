import { saveContact, resolveShape } from "../../MobilePublicSettings";
import { Pencil } from "lucide-react";
import { useEffect, useState } from "react";
import { EditModal } from "../../MobilePublicSettings";

export function ProfileActions({
  user,
  theme,
  contact,
  onConnect,
  layout,
  editable = false,
  onContactChange,
}: any) {
  const shapeClass = resolveShape(layout?.button_style);
  const [editing, setEditing] = useState(false);

  const [local, setLocal] = useState({
    contact_title: "",
    connect_title: "",
  });

  useEffect(() => {
    if (!editing) return;

    setLocal((prev) => {
      // 🔒 keep existing draft if already present
      if (prev.contact_title || prev.connect_title) return prev;

      return {
        contact_title: contact?.contact_title || "",
        connect_title: contact?.connect_title || "",
      };
    });
  }, [editing, contact]);


  const commit = () => {
    onContactChange?.((prev: any) => ({
      ...prev,
      ...local,
    }));
    setEditing(false);
  };
  useEffect(() => {
    if (!editing) {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.width = "";
      document.body.style.overflow = "";
      return;
    }

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

      window.scrollTo(0, parseInt(y || "0") * -1);
    };
  }, [editing]);

  return (
    <div className="relative mt-4">
      {editable && (
        <button
          onClick={() => setEditing(true)}
          className="absolute -top-4 -right-0 z-20 h-9 w-9 rounded-full shadow
          flex items-center justify-center bg-orange-500 text-white"
        >
          <Pencil size={16} />
        </button>
      )}

      {/* ACTION BUTTONS */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => saveContact(user)}
          className={`h-11 border text-sm font-medium ${shapeClass}`}
          disabled={true}
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

      {/* EDIT PANEL */}
      {editing && (
        <EditModal
          open={editing}
          onClose={() => setEditing(false)}
          onSave={commit}          // ✅ save handled here
        >
          {/* TITLE */}
          <h3 className="text-lg font-semibold">
            Edit Contact Buttons
          </h3>

          {/* BODY */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Save Contact Button Label
              </label>
              <input
                value={local.contact_title}
                onChange={(e) =>
                  setLocal((s) => ({
                    ...s,
                    contact_title: e.target.value,
                  }))
                }
                className="w-full border rounded-lg p-2 text-sm"
                placeholder="e.g. Save Contact"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Connect Button Label
              </label>
              <input
                value={local.connect_title}
                onChange={(e) =>
                  setLocal((s) => ({
                    ...s,
                    connect_title: e.target.value,
                  }))
                }
                className="w-full border rounded-lg p-2 text-sm"
                placeholder="e.g. Connect Now"
              />
            </div>
          </div>
        </EditModal>
      )}

    </div>
  );
}
