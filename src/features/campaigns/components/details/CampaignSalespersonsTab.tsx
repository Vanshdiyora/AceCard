import { useNavigate } from "react-router-dom";
import { useMemo, useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../../../app/hooks";

import { updateCampaign } from "../../slice";
import { fetchTeam } from "../../../teams/slice";
import DataTable, { type Column } from "../../../../common/components/table/DataTable";
import type { CampaignSalesperson } from "../../types";

type Props = {
  campaignId: number;
  assignedReps?: CampaignSalesperson[];
};

type SalespersonRow = {
  id: number;
  name: string;
  totalLeads: number;
  totalDealAmount: number;
};

export default function CampaignSalespersonsTab({
  campaignId,
  assignedReps = [],
}: Props) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { members, loading } = useAppSelector((s) => s.team);

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<number[]>([]);

  const [salesPage, setSalesPage] = useState(1);
  const [hasNextSales, setHasNextSales] = useState(true);
  const [loadingMoreSales, setLoadingMoreSales] = useState(false);

  useEffect(() => {
    if (open) {
      queueMicrotask(() => {
        setSalesPage(1);
        setHasNextSales(true);
      });

      dispatch(fetchTeam({ page: 1, page_size: 10, role: "sales_rep", append: true }))
        .unwrap()
        .then((res: any) => setHasNextSales(res.meta.has_next));
    }
  }, [open, dispatch]);

  const allSalesReps = useMemo(
    () => members.filter((m) => m.role === "sales_rep" && m.status === "active"),
    [members]
  );

  const assignedIds = useMemo(
    () => assignedReps.map((r) => r.id),
    [assignedReps]
  );

  const salespersons: SalespersonRow[] = useMemo(() => {
    return assignedReps.map((r) => ({
      id: r.id,
      name: r.name,
      totalLeads: r.leads_generated ?? 0,
      totalDealAmount: r.total_deal_amount ?? 0,
    }));
  }, [assignedReps]);

  const available = useMemo(
    () => allSalesReps.filter((m) => !assignedIds.includes(m.id)),
    [allSalesReps, assignedIds]
  );

  const toggle = (id: number) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const assignSelected = async () => {
    if (!selected.length) return;

    const updatedIds = Array.from(new Set([...assignedIds, ...selected]));

    await dispatch(
      updateCampaign({ id: campaignId, data: { assigned_reps_ids: updatedIds } })
    );

    setSelected([]);
    setOpen(false);
  };

  const loadMoreSales = async () => {
    if (loadingMoreSales || !hasNextSales) return;
    setLoadingMoreSales(true);
    const next = salesPage + 1;
    const res: any = await dispatch(fetchTeam({ page: next, page_size: 10, role: "sales_rep", append: true })).unwrap();
    setSalesPage(next);
    setHasNextSales(res.meta.has_next);
    setLoadingMoreSales(false);
  };

  const columns: Column<SalespersonRow>[] = [
    { header: "Salesperson Name", accessor: "name" },
    { header: "Total Leads", accessor: "totalLeads", align: "center", width: "120px" },
    {
      header: "Total Deal Amount",
      accessor: "totalDealAmount",
      align: "right",
      width: "160px",
      render: (row) => `₹${row.totalDealAmount.toLocaleString()}`,
    },
  ];

  if (loading) return <div className="py-6 text-gray-500">Loading…</div>;

  return (
    <div>
      {/* Table */}
      <div className="rounded-2xl border mt-6">
        <DataTable<SalespersonRow>
          columns={columns}
          data={salespersons}
          emptyText="No salespersons assigned to this campaign"
          onRowClick={(row) => navigate(`/admin/team/${row.id}`)}
        />
      </div>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white w-[420px] max-h-[80vh] rounded-2xl shadow-xl flex flex-col overflow-hidden">
            <div className="p-5 border-b">
              <h4 className="text-lg font-semibold">Assign Salespersons</h4>
              <p className="text-sm text-gray-500">
                Select active sales reps to add to this campaign
              </p>
            </div>

            <div
              className="p-5 space-y-2 overflow-y-auto"
              onScroll={(e) => {
                const el = e.currentTarget;
                if (el.scrollTop + el.clientHeight >= el.scrollHeight - 20) {
                  loadMoreSales();
                }
              }}
            >
              {available.length === 0 && (
                <div className="text-sm text-gray-400 text-center py-6">
                  All salespersons are already assigned
                </div>
              )}

              {available.map((sp) => (
                <label
                  key={sp.id}
                  className="flex items-center justify-between px-3 py-2 rounded-lg border hover:bg-gray-50 cursor-pointer"
                >
                  <span className="text-sm">{sp.name}</span>
                  <input
                    type="checkbox"
                    checked={selected.includes(sp.id)}
                    onChange={() => toggle(sp.id)}
                    className="h-4 w-4 accent-purple-600"
                  />
                </label>
              ))}

              {loadingMoreSales && (
                <div className="text-center text-sm text-gray-400 py-3">
                  Loading more…
                </div>
              )}
            </div>

            <div className="p-4 border-t flex justify-end gap-3 bg-gray-50">
              <button
                className="px-4 py-2 rounded-lg text-sm border hover:bg-gray-100"
                onClick={() => {
                  setSelected([]);
                  setOpen(false);
                }}
              >
                Cancel
              </button>
              <button
                disabled={!selected.length}
                onClick={assignSelected}
                className="px-4 py-2 rounded-lg text-sm bg-purple-600 text-white disabled:opacity-40 hover:bg-purple-700 transition"
              >
                Assign Selected
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
