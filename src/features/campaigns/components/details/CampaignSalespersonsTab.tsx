import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../../app/hooks";

import { fetchTeam } from "../../../teams/slice";
import { updateCampaign } from "../../slice";

type Props = {
  campaignId: number;
  assignedReps?: number[];
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
    if (members.length === 0) {
      dispatch(fetchTeam());
    }
  }, [dispatch, members.length]);

  const allSalesReps = useMemo(
    () => members.filter((m) => m.role === "sales_rep" && m.status === "active"),
    [members]
  );

  const salespersons = useMemo(
    () => allSalesReps.filter((m) => assignedReps.includes(m.id)),
    [allSalesReps, assignedReps]
  );

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

  if (loading) return <div className="py-6 text-gray-500">Loading…</div>;

  return (
    <div className="space-y-4">

      {/* Assign Button */}
      <button
        onClick={() => setOpen(true)}
        className="px-4 py-1 bg-purple-600 text-white rounded text-sm"
      >
        Assign Salespersons
      </button>

      {/* Assigned Table */}
      {salespersons.length === 0 ? (
        <div className="py-6 text-gray-500 text-center">
          No salespersons assigned to this campaign
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="p-3">Salesperson</th>
                <th className="p-3">Role</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {salespersons.map((sp) => (
                <tr
                  key={sp.id}
                  onClick={() => navigate(`/admin/team/${sp.id}`)}
                  className="cursor-pointer hover:bg-gray-50 border-t"
                >
                  <td className="p-3 font-medium">{sp.name}</td>
                  <td className="p-3 capitalize">{sp.role}</td>
                  <td className="p-3 capitalize">{sp.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-[420px] max-h-[80vh] rounded-xl shadow-lg flex flex-col">
            <div className="p-4 border-b text-lg font-medium">
              Assign Salespersons
            </div>

            <div className="p-4 space-y-2 overflow-y-auto">
              {available.length === 0 && (
                <div className="text-sm text-gray-500 text-center">
                  All salespersons are already assigned
                </div>
              )}

              {available.map((sp) => (
                <label key={sp.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={selected.includes(sp.id)}
                    onChange={() => toggle(sp.id)}
                  />
                  <span>{sp.name}</span>
                </label>
              ))}
            </div>

            <div className="p-4 border-t flex justify-end gap-3">
              <button
                className="px-4 py-1 bg-gray-200 rounded"
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
                className="px-4 py-1 bg-purple-600 text-white rounded disabled:opacity-40"
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
