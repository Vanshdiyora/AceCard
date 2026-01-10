import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../../app/hooks";

import { fetchTeam } from "../../../teams/slice";
import { updateCampaign } from "../../slice";
import DataTable, { type Column } from "../../../../common/components/table/DataTable";

type Props = {
  campaignId: number;
  assignedReps?: number[];
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

  useEffect(() => {
    if (members.length === 0) dispatch(fetchTeam());
  }, [dispatch, members.length]);

  const allSalesReps = useMemo(
    () => members.filter((m) => m.role === "sales_rep" && m.status === "active"),
    [members]
  );

  const salespersons = useMemo(() => {
    return allSalesReps
      .filter((m) => assignedReps.includes(m.id))
      .map((m) => ({
        id: m.id,
        name: m.name,
        totalLeads: m.total_leads ?? 0,
        totalDealAmount: m.total_deal_amount ?? 0,
      }));
  }, [allSalesReps, assignedReps]);

  const available = useMemo(
    () => allSalesReps.filter((m) => !assignedReps.includes(m.id)),
    [allSalesReps, assignedReps]
  );

  const toggle = (id: number) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const assignSelected = async () => {
    if (!selected.length) return;

    const updated = Array.from(new Set([...assignedReps, ...selected]));
    await dispatch(updateCampaign({ id: campaignId, data: { assigned_reps: updated } }));

    setSelected([]);
    setOpen(false);
  };

  const columns: Column<SalespersonRow>[] = [
    { header: "Salesperson Name", accessor: "name" },
    { header: "Total Leads", accessor: "totalLeads", align: "center", width: "120px" },
    {
      header: "Total Deal Amount",
      accessor: "totalDealAmount",
      align: "right",
      width: "160px",
      render: (row) => `$${row.totalDealAmount.toLocaleString()}`,
    },
  ];

  if (loading) return <div className="py-6 text-gray-500">Loading…</div>;

return (
  <div className="space-y-6">

    {/* Header */}
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-lg font-semibold">Assigned Salespersons</h3>
        <p className="text-sm text-gray-500">
          People currently working on this campaign
        </p>
      </div>

      <button
        onClick={() => setOpen(true)}
        className="px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow hover:shadow-md transition"
      >
        + Assign
      </button>
    </div>

    {/* Table Card */}
    <div className="rounded-2xl border">
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

          {/* Modal Header */}
          <div className="p-5 border-b">
            <h4 className="text-lg font-semibold">Assign Salespersons</h4>
            <p className="text-sm text-gray-500">
              Select active sales reps to add to this campaign
            </p>
          </div>

          {/* Modal Content */}
          <div className="p-5 space-y-2 overflow-y-auto">
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
          </div>

          {/* Modal Footer */}
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
