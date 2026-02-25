import { useEffect, useMemo, useState } from "react";
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
}: {
    open: boolean;
    leads: number[];
    currentId: number;
    onConfirm: (toId: number) => void;
    onClose: () => void;
    loading: boolean;
}) {

    const dispatch = useAppDispatch();
    const { members, meta, loading: teamLoading } = useAppSelector((s) => s.team);

    const [form, setForm] = useState<any>({});
    const [errors, setErrors] = useState<Record<string, string | null>>({});

    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");

    /* 🔁 initial load */
    useEffect(() => {
        if (open) {
            setPage(1);
            dispatch(
                fetchTeam({
                    page: 1,
                    page_size: 20,
                    search,
                    append: false,
                })
            );
        }
    }, [open, search, dispatch]);

    /* 🔁 load next page */
    const loadMore = () => {
        if (meta.members?.has_next && !teamLoading) {
            const next = page + 1;
            setPage(next);
            dispatch(
                fetchTeam({
                    page: next,
                    page_size: 20,
                    search,
                    append: true,
                })
            );
        }
    };

    const fields: FieldConfig[] = useMemo(
        () => [
            {
                name: "to_rep_id",
                label: "Transfer To",
                type: "search-select",
                required: true,
                placeholder: "Search manager / rep",
                showLoader: teamLoading,
                onScrollEnd: loadMore,        // 👈 infinite scroll
                onSearch: (v) => {
                    setSearch(v);
                    setPage(1);
                },
                options: members
                    .filter(
                        (m) =>
                            m.id !== currentId &&
                            m.status !== "suspended"   // 👈 exclude suspended
                    )
                    .map((m) => ({
                        label: `${m.name} • ${m.role.replace("_", " ")}`,
                        value: m.id,
                    })),

            },
        ],
        [members, teamLoading, meta, page]
    );

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="w-[420px] max-w-[90vw] rounded-2xl bg-white shadow-2xl border p-6 space-y-5">
                <div>
                    <h3 className="text-lg font-semibold">Transfer Leads</h3>
                    <p className="text-sm text-gray-500">
                        This member has{" "}
                        <span className="font-medium text-purple-600">{leads.length}</span>{" "}
                        leads.
                    </p>
                </div>

                <div className="bg-gray-50 rounded-xl border">
                    <DynamicForm
                        fields={fields}
                        form={form}
                        errors={errors}
                        setErrors={setErrors}
                        onChange={(k, v) => setForm((p: any) => ({ ...p, [k]: v }))}
                    />
                </div>

                <div className="flex justify-end gap-3">
                    <button onClick={onClose} className="btn-outline">
                        Cancel
                    </button>

                    <button
                        disabled={!form.to_rep_id || loading}
                        onClick={() => onConfirm(form.to_rep_id)}
                        className={`px-5 py-2 rounded-xl text-sm font-medium ${!form.to_rep_id || loading
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
