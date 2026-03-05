import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { fetchTeam } from "../slice";
import DynamicForm, { type FieldConfig } from "../../../common/ui/DynamicForm";

export function TransferLeadsModal({
  open,
  leads,
  currentId,
  onConfirm,
  onClose,
  loading,
  showLeadCount = true,
}: {
  open: boolean;
  leads: number[];
  currentId: number;
  onConfirm: (toId: number) => void;
  onClose: () => void;
  loading: boolean;
  showLeadCount?: boolean;
}) {
  const dispatch = useAppDispatch();
  const { members, meta, loading: teamLoading } = useAppSelector(
    (s) => s.team
  );

  const [form, setForm] = useState<any>({});
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  // ✅ Refs so loadMore never has stale values, and never needs to be recreated
  const metaRef = useRef(meta);
  const teamLoadingRef = useRef(teamLoading);
  const searchRef = useRef(search);
  const pageRef = useRef(page);

  useEffect(() => { metaRef.current = meta; }, [meta]);
  useEffect(() => { teamLoadingRef.current = teamLoading; }, [teamLoading]);
  useEffect(() => { searchRef.current = search; }, [search]);
  useEffect(() => { pageRef.current = page; }, [page]);

  /* -----------------------------
     Initial Load — fires only when modal opens
  ------------------------------ */
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
        append: false,
      })
    );
  }, [open]); // ✅ NOT depending on search

  /* -----------------------------
     Re-fetch on Search Change
  ------------------------------ */
  useEffect(() => {
    if (!open) return;

    // Reset to page 1 on new search
    setPage(1);

    dispatch(
      fetchTeam({
        page: 1,
        page_size: 10,
        search,
        append: false, // ✅ replace list, don't append
      })
    );
  }, [search]); // ✅ only fires on search change, NOT on open

  /* -----------------------------
     Load More — stable reference, reads from refs
  ------------------------------ */
  const loadMore = useCallback(() => {
    if (teamLoadingRef.current) {
      // Already fetching, skip
      return;
    }

    if (!metaRef.current?.members?.has_next) {
      // No more pages
      return;
    }

    setPage((prev) => {
      const next = prev + 1;
      dispatch(
        fetchTeam({
          page: next,
          page_size: 10,
          search: searchRef.current,
          append: true,
        })
      );
      return next;
    });
  }, [dispatch]); // ✅ only dispatch — which never changes

  /* -----------------------------
     Field Config
     ✅ loadMore is now stable so useMemo won't rebuild on every fetch
     ✅ Removed teamLoading from deps — SearchableSelect reads it via prop
  ------------------------------ */
const roleMap: Record<string, string> = {
  sales_rep: "Sales Person",
};

const filteredMembers = useMemo(
  () =>
    members
      .filter((m) => m.id !== currentId && m.status !== "suspended")
      .map((m) => {
        const formattedRole =
          roleMap[m.role] ||
          m.role.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

        return {
          label: `${m.name} • ${formattedRole}`,
          value: m.id,
        };
      }),
  [members, currentId]
);

  const fields: FieldConfig[] = useMemo(
    () => [
      {
        name: "to_rep_id",
        label: "Transfer To",
        type: "search-select",
        required: true,
        placeholder: "Search manager / rep",
        showLoader: teamLoading,     // ✅ passed as prop so SearchableSelect shows spinner
        onScrollEnd: loadMore,       // ✅ stable reference — won't cause re-renders
        onSearch: (value: string) => {
          setSearch(value);          // triggers the search useEffect above
        },
        options: filteredMembers,
      },
    ],
    [filteredMembers, teamLoading, loadMore] // loadMore is now stable
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-[420px] max-w-[90vw] rounded-2xl bg-white shadow-2xl border p-6 space-y-5">
        {/* Header */}
        <div>
          <h3 className="text-lg font-semibold">
            {leads.length > 1 ? "Transfer Leads" : "Transfer Lead"}
          </h3>

          {showLeadCount && leads.length > 1 && (
            <p className="text-sm text-gray-500">
              This member has{" "}
              <span className="font-medium text-purple-600">
                {leads.length}
              </span>{" "}
              leads.
            </p>
          )}
        </div>

        {/* Form */}
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

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="btn-outline">
            Cancel
          </button>

          <button
            disabled={!form.to_rep_id || loading}
            onClick={() => onConfirm(form.to_rep_id)}
            className={`px-5 py-2 rounded-xl text-sm font-medium transition ${
              !form.to_rep_id || loading
                ? "bg-gray-200 text-gray-400"
                : "bg-red-600 text-white hover:bg-red-700"
            }`}
          >
            {loading ? "Transferring..." : "Transfer & Continue"}
          </button>
        </div>
      </div>
    </div>
  );
}