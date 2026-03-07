import { useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import BrandLoader from "../../../common/ui/BrandLoader";
import { Pencil, Check, X, Trash2, Plus, Save } from "lucide-react";

import {
  fetchSuggestedQuestions,
  addSuggestedQuestion,
  editSuggestedQuestion,
  removeSuggestedQuestion,
  reorderSuggestedQuestions,
} from "../slice";

import ResultModal from "../../../common/ui/ResultModal";
import CommonItemsReorder from "./vice/sections/CommonItemsReorder";

export default function SuggestedQuestions() {

  const dispatch = useAppDispatch();

  const { data, loading, saving, error } = useAppSelector(
    (s) => s.settings.suggestedQuestions
  );

  const [newQuestion, setNewQuestion] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const [isMutating, setIsMutating] = useState(false);
  const [orderChanged, setOrderChanged] = useState(false);

  const [result, setResult] = useState({
    open: false,
    success: true,
    message: "",
  });

  const inputRef = useRef<HTMLInputElement | null>(null);

  const showResult = (success: boolean, message: string) => {
    setResult({ open: true, success, message });
  };

  const isBusy = loading || saving || isMutating;

  /* ---------------------------------------------------- */
  /* Scroll lock when modal open                          */
  /* ---------------------------------------------------- */

  const lockScroll = () => {
    const scrollBarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    document.body.style.paddingRight = `${scrollBarWidth}px`;
  };

  const unlockScroll = () => {
    document.documentElement.style.overflow = "";
    document.body.style.overflow = "";
    document.body.style.paddingRight = "";
  };

  useEffect(() => {
    if (result.open) lockScroll();
    else unlockScroll();

    return unlockScroll;
  }, [result.open]);

  /* ---------------------------------------------------- */

  useEffect(() => {
    dispatch(fetchSuggestedQuestions());
  }, [dispatch]);

  /* Autofocus edit */
  useEffect(() => {
    if (editingId !== null && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingId]);

  /* ---------------------------------------------------- */
  /* ADD QUESTION                                         */
  /* ---------------------------------------------------- */

  const handleAdd = async () => {

    if (!newQuestion.trim()) {
      showResult(false, "Please enter a question before adding.");
      return;
    }

    try {

      setIsMutating(true);

      await dispatch(addSuggestedQuestion(newQuestion)).unwrap();

      setNewQuestion("");

      showResult(true, "Question added successfully.");

    } catch (err: any) {

      showResult(false, err?.message || "Failed to add question");

    } finally {

      setIsMutating(false);

    }
  };

  /* ---------------------------------------------------- */
  /* EDIT QUESTION                                        */
  /* ---------------------------------------------------- */

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

    try {

      setIsMutating(true);

      await dispatch(
        editSuggestedQuestion({
          id: editingId,
          question: editingValue
        })
      ).unwrap();

      cancelEdit();

      showResult(true, "Question updated successfully");

    } catch {

      showResult(false, "Failed to update question");

    } finally {

      setIsMutating(false);

    }
  };

  /* ---------------------------------------------------- */
  /* DELETE                                               */
  /* ---------------------------------------------------- */

  const handleDelete = async (id: number) => {

    try {

      setIsMutating(true);

      await dispatch(removeSuggestedQuestion(id)).unwrap();

      showResult(true, "Question deleted");

    } catch {

      showResult(false, "Failed to delete question");

    } finally {

      setIsMutating(false);

    }
  };

  /* ---------------------------------------------------- */
  /* REORDER                                              */
  /* ---------------------------------------------------- */

  const reorderedItems = data.map((q) => ({
    ...q,
    id: String(q.id),
  }));

  const handleReorder = (items: any[]) => {

    const mapped = items.map((i) => ({
      ...i,
      id: Number(i.id),
    }));

    dispatch(reorderSuggestedQuestions(mapped));

    setOrderChanged(true);
  };

  /* ---------------------------------------------------- */
  /* SAVE ORDER                                           */
  /* ---------------------------------------------------- */

  const saveOrder = async () => {

    try {

      setIsMutating(true);

      // await dispatch(saveSuggestedQuestionsOrder(data)).unwrap();

      setOrderChanged(false);

      showResult(true, "Order saved successfully");

    } catch {

      showResult(false, "Failed to save order");

    } finally {

      setIsMutating(false);

    }
  };

  /* ---------------------------------------------------- */

  return (
    <div className="bg-white rounded-3xl p-6 shadow-lg border">

      <div className="flex justify-between items-center mb-5">

        <h2 className="text-xl font-semibold">
          Suggested Lead Questions
        </h2>

        {orderChanged && (
          <button
            onClick={saveOrder}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-purple-600 text-white rounded-xl hover:bg-purple-700"
          >
            <Save size={16} />
            Save Order
          </button>
        )}

      </div>

      {/* ADD QUESTION */}

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

      {/* LIST */}

      {isBusy ? (

        <div className="flex justify-center py-10">
          <BrandLoader />
        </div>

      ) : data.length === 0 ? (

        <div className="py-10 text-center text-sm text-gray-400">
          No suggested questions added
        </div>

      ) : (

        <CommonItemsReorder
          items={reorderedItems}
          onChange={handleReorder}
          disabled={isBusy}
          renderItem={(q: any) => {

            const isEditing = editingId === Number(q.id);

            return (

              <div className="flex items-center gap-3 border rounded-xl pr-4 pl-1 py-2 h-11">

                <div className="flex-1 flex items-center">

                  {isEditing ? (

                    <input
                      ref={inputRef}
                      value={editingValue}
                      onChange={(e) => setEditingValue(e.target.value)}
                      className="w-full border rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                    />

                  ) : (

                    <span className="text-sm text-gray-800 truncate pl-4">
                      {q.question}
                    </span>

                  )}

                </div>

                <div className="flex items-center justify-end gap-2 w-20">

                  {!isEditing ? (
                    <>
                      <button
                        onClick={() => startEdit(Number(q.id), q.question)}
                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600"
                      >
                        <Pencil size={14} />
                      </button>

                      <button
                        onClick={() => handleDelete(Number(q.id))}
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

              </div>
            );
          }}
        />

      )}

      <ResultModal
        open={result.open}
        success={result.success}
        message={result.message}
        onClose={() => setResult({ ...result, open: false })}
      />

      {!isBusy && error && (
        <p className="text-red-500 text-sm mt-3">{error}</p>
      )}

    </div>
  );
}