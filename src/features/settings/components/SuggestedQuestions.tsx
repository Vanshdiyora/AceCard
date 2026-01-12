import { useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import BrandLoader from "../../../common/ui/BrandLoader";
import { Pencil, Check, X, Trash2, Plus } from "lucide-react";
import {
  fetchSuggestedQuestions,
  addSuggestedQuestion,
  editSuggestedQuestion,
  removeSuggestedQuestion,
} from "../slice";

export default function SuggestedQuestions() {
  const dispatch = useAppDispatch();
  const { data, loading, saving, error } = useAppSelector(
    (s) => s.settings.suggestedQuestions
  );

  const [newQuestion, setNewQuestion] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const [isMutating, setIsMutating] = useState(false);

  const inputRef = useRef<HTMLInputElement | null>(null);

  const isBusy = loading || saving || isMutating;

  useEffect(() => {
    dispatch(fetchSuggestedQuestions());
  }, [dispatch]);

  // 🔹 Auto focus when edit starts
  useEffect(() => {
    if (editingId !== null && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingId]);

  const handleAdd = async () => {
    if (!newQuestion.trim()) return;
    setIsMutating(true);
    await dispatch(addSuggestedQuestion(newQuestion));
    setIsMutating(false);
    setNewQuestion("");
  };

  const startEdit = (id: number, value: string) => {
    setEditingId(id);
    setEditingValue(value);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingValue("");
  };

  const saveEdit = async () => {
    if (!editingId || !editingValue.trim()) return;
    setIsMutating(true);
    await dispatch(editSuggestedQuestion({ id: editingId, question: editingValue }));
    setIsMutating(false);
    cancelEdit();
  };

  const handleDelete = async (id: number) => {
    setIsMutating(true);
    await dispatch(removeSuggestedQuestion(id));
    setIsMutating(false);
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-lg border">
      <h2 className="text-xl font-semibold mb-5">Suggested Lead Questions</h2>

      <div className="flex gap-2 mb-6">
        <input
          value={newQuestion}
          onChange={(e) => setNewQuestion(e.target.value)}
          placeholder="Add a new question..."
          className="flex-1 border rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
          disabled={isBusy}
        />
        <button
          onClick={handleAdd}
          disabled={isBusy}
          className="flex items-center gap-1 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50"
        >
          <Plus size={16} />
          Add
        </button>
      </div>

      {isBusy ? (
        <div className="flex justify-center py-10">
          <BrandLoader />
        </div>
      ) : data.length === 0 ? (
        <div className="py-10 text-center text-sm text-gray-400">
          No suggested questions added
        </div>
      ) : (
        <ul className="space-y-2">
          {data.map((q) => {
            const isEditing = editingId === q.id;

            return (
              <li
                key={q.id}
                className="flex items-center gap-3 border rounded-xl px-4 py-2 h-11"
              >
                <div className="flex-1 flex items-center">
                  {isEditing ? (
                    <input
                      ref={inputRef}
                      value={editingValue}
                      onChange={(e) => setEditingValue(e.target.value)}
                      className="w-full border rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                  ) : (
                    <span className="text-sm text-gray-800 truncate">
                      {q.question}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2 w-20">
                  {!isEditing ? (
                    <>
                      <button
                        onClick={() => startEdit(q.id, q.question)}
                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(q.id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"
                      >
                        <Trash2 size={14} />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={saveEdit}
                        className="p-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100"
                      >
                        <Check size={14} />
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="p-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200"
                      >
                        <X size={14} />
                      </button>
                    </>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {!isBusy && error && (
        <p className="text-red-500 text-sm mt-3">{error}</p>
      )}
    </div>
  );
}
