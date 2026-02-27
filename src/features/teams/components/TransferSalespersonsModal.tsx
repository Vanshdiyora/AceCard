import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { fetchTeam, transferSalespersons } from "../slice";
import DynamicForm, { type FieldConfig } from "../../../common/ui/DynamicForm";

export function TransferSalespersonsModal({
  open,
  fromManagerId,
  onClose,
  onSuccess,
}: {
  open: boolean;
  fromManagerId: number;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const dispatch = useAppDispatch();

  const {
    managers,
    meta,
    loading: teamLoading,
    transferSalespersonsLoading,
  } = useAppSelector((s) => s.team);

  const [form, setForm] = useState<any>({});
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [, setPage] = useState(1);
  const [search, setSearch] = useState("");

  /* =============================
     REFS (stable loadMore)
  ============================== */
  const metaRef = useRef(meta);
  const teamLoadingRef = useRef(teamLoading);
  const searchRef = useRef(search);

  useEffect(() => {
    metaRef.current = meta;
  }, [meta]);

  useEffect(() => {
    teamLoadingRef.current = teamLoading;
  }, [teamLoading]);

  useEffect(() => {
    searchRef.current = search;
  }, [search]);

  /* =============================
     INITIAL LOAD
  ============================== */
  useEffect(() => {
    if (!open) return;

    setForm({});
    setErrors({});
    setPage(1);
    setSearch("");

    dispatch(
      fetchTeam({
        page: 1,
        page_size: 10,
        search: "",
        role: "manager",
        append: false,
      })
    );
  }, [open, dispatch]);

  /* =============================
     SEARCH REFETCH
  ============================== */
  useEffect(() => {
    if (!open) return;

    setPage(1);

    dispatch(
      fetchTeam({
        page: 1,
        page_size: 10,
        search,
        role: "manager",
        append: false,
      })
    );
  }, [search]);

  /* =============================
     LOAD MORE (pagination)
  ============================== */
  const loadMore = useCallback(() => {
    if (teamLoadingRef.current) return;

    // 🔥 IMPORTANT FIX
    if (!metaRef.current?.managers?.has_next) return;

    setPage((prev) => {
      const next = prev + 1;

      dispatch(
        fetchTeam({
          page: next,
          page_size: 10,
          search: searchRef.current,
          role: "manager",
          append: true,
        })
      );

      return next;
    });
  }, [dispatch]);

  /* =============================
     FILTER MANAGERS
  ============================== */
  const filteredManagers = useMemo(
    () =>
      managers
        .filter(
          (m) =>
            m.id !== fromManagerId &&
            m.status !== "suspended"   // ✅ exclude suspended managers
        )
        .map((m) => ({
          label: m.name,
          value: m.id,
        })),
    [managers, fromManagerId]
  );

  /* =============================
     FORM FIELDS
  ============================== */
  const fields: FieldConfig[] = useMemo(
    () => [
      {
        name: "to_manager_id",
        label: "Transfer To Manager",
        type: "search-select",
        required: true,
        placeholder: "Search manager",
        showLoader: teamLoading,
        onScrollEnd: loadMore,
        onSearch: (value: string) => setSearch(value),
        options: filteredManagers,
      },
    ],
    [filteredManagers, teamLoading, loadMore]
  );

  if (!open) return null;

  /* =============================
     CONFIRM HANDLER
  ============================== */
  const handleConfirm = async () => {
    if (!form.to_manager_id) return;

    try {
      await dispatch(
        transferSalespersons({
          from_manager_id: fromManagerId,
          to_manager_id: form.to_manager_id,
        })
      ).unwrap();

      onSuccess();
    } catch {
      // optional: show toast if needed
    }
  };

  /* =============================
     UI
  ============================== */
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-[420px] max-w-[90vw] rounded-2xl bg-white shadow-2xl border p-6 space-y-5">

        <div>
          <h3 className="text-lg font-semibold">
            Transfer Salespersons
          </h3>
          <p className="text-sm text-gray-500">
            Transfer all salespersons under this manager.
          </p>
        </div>

        <div className="bg-gray-50 rounded-xl border">
          <DynamicForm
            fields={fields}
            form={form}
            errors={errors}
            setErrors={setErrors}
            onChange={(key, value) =>
              setForm((prev: any) => ({
                ...prev,
                [key]: value,
              }))
            }
          />
        </div>

        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="btn-outline">
            Cancel
          </button>

          <button
            disabled={!form.to_manager_id || transferSalespersonsLoading}
            onClick={handleConfirm}
            className={`px-5 py-2 rounded-xl text-sm font-medium transition ${!form.to_manager_id || transferSalespersonsLoading
                ? "bg-gray-200 text-gray-400"
                : "bg-purple-600 text-white hover:bg-purple-700"
              }`}
          >
            {transferSalespersonsLoading
              ? "Transferring..."
              : "Transfer & Finish"}
          </button>
        </div>
      </div>
    </div>
  );
}