import { useState, useEffect } from "react";
import { useAppDispatch } from "../../../app/hooks";
import {
  createVendorNote,
  updateVendorNote,
  archiveVendorNote,
} from "../slice";
import BrandLoader from "../../../common/ui/BrandLoader";
import ConfirmationModal from "../../../common/ui/ConfirmationModal";
import { Pencil, Trash2, X } from "lucide-react";

export default function VendorNotesModal({
  open,
  onClose,
  vendorId,
  notes,
  loading,
}: any) {
  const dispatch = useAppDispatch();

  const [content, setContent] = useState("");
  const [editNote, setEditNote] = useState<any>(null);
  const [confirmDelete, setConfirmDelete] = useState<any>(null);

  if (!open) return null;

  const activeNotes = notes?.filter((n: any) => !n.is_archived) ?? [];

  const formatDate = (date: string) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleString();
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl w-[520px] max-h-[80vh] p-6 space-y-4 overflow-auto">

          {/* Header */}
          <div className="flex justify-between items-center">
            <h2 className="font-semibold text-lg">Vendor Notes</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={18} />
            </button>
          </div>

          {/* Add Note */}
          <div className="flex gap-2">
            <input
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Add note..."
              className="flex-1 border rounded-lg px-3 py-2 text-sm"
            />

            <button
              className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700"
              onClick={async () => {
                if (!content.trim()) return;

                await dispatch(
                  createVendorNote({ vendorId, content })
                ).unwrap();

                setContent("");
              }}
            >
              Add
            </button>
          </div>

          {/* Notes */}
          {loading ? (
            <BrandLoader message="Loading notes..." />
          ) : activeNotes.length === 0 ? (
            <p className="text-sm text-gray-400 text-center">No notes yet.</p>
          ) : (
            activeNotes.map((n: any) => (
              <div key={n.id} className="border rounded-lg p-3 space-y-3">

                {/* Note Content */}
                <p className="text-sm">{n.content}</p>

                {/* Actions */}
                <div className="flex items-center justify-between">

                  <div className="flex items-center gap-3">

                    <button
                      className="text-purple-600 hover:text-purple-800"
                      onClick={() => setEditNote(n)}
                    >
                      <Pencil size={16} />
                    </button>

                    <button
                      className="text-red-500 hover:text-red-700"
                      onClick={() => setConfirmDelete(n)}
                    >
                      <Trash2 size={16} />
                    </button>

                  </div>

                  <span className="text-xs text-gray-400">
                    {formatDate(n.created_at)}
                  </span>

                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Edit Note Modal */}
      <EditNoteModal
        open={!!editNote}
        note={editNote}
        onClose={() => setEditNote(null)}
        onSave={async (updatedContent: string) => {
          await dispatch(
            updateVendorNote({
              vendorId,
              noteId: editNote.id,
              content: updatedContent,
            })
          ).unwrap();

          setEditNote(null);
        }}
      />

      {/* Delete Confirmation */}
      <ConfirmationModal
        open={!!confirmDelete}
        title="Delete Note"
        message="Are you sure you want to delete this note?"
        confirmLabel="Delete"
        confirmVariant="danger"
        onClose={() => setConfirmDelete(null)}
        onConfirm={async () => {
          await dispatch(
            archiveVendorNote({
              vendorId,
              noteId: confirmDelete.id,
            })
          ).unwrap();

          setConfirmDelete(null);
        }}
      />
    </>
  );
}


/* ---------------- Edit Note Modal ---------------- */

function EditNoteModal({ open, note, onClose, onSave }: any) {
  const [content, setContent] = useState("");

  useEffect(() => {
    queueMicrotask(() => setContent(note?.content ?? ""));
  }, [note]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-[60]">
      <div className="bg-white w-[420px] rounded-xl p-6 space-y-4">

        <div className="flex justify-between items-center">
          <h3 className="font-semibold">Edit Note</h3>
          <button onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full border rounded-lg p-3 text-sm h-28"
        />

        <div className="flex justify-end gap-3">
          <button
            className="text-gray-500 text-sm"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm"
            onClick={() => onSave(content)}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}