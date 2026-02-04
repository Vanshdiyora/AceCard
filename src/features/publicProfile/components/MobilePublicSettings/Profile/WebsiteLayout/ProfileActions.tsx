import { saveContact, resolveShape } from "../../MobilePublicSettings";
import { Pencil, X } from "lucide-react";
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
    if (editing) {
      setLocal({
        contact_title: contact?.contact_title || "",
        connect_title: contact?.connect_title || "",
      });
    }
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
        <EditModal open onClose={() => setEditing(false)}>
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Edit Contact Buttons</h3>
            <button
              onClick={() => setEditing(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={18} />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Save Contact Button Label
              </label>
              <input
                value={local.contact_title}
                onChange={(e) =>
                  setLocal((s) => ({ ...s, contact_title: e.target.value }))
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
                  setLocal((s) => ({ ...s, connect_title: e.target.value }))
                }
                className="w-full border rounded-lg p-2 text-sm"
                placeholder="e.g. Connect Now"
              />
            </div>
          </div>

          {/* FOOTER */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={() => setEditing(false)}
              className="flex-1 py-2 rounded-lg border text-sm font-semibold"
            >
              Close
            </button>

            <button
              onClick={commit}
              className="flex-1 py-2 rounded-lg bg-purple-600 text-white font-semibold"
            >
              Done
            </button>
          </div>
        </EditModal>
      )}
    </div>
  );
}
