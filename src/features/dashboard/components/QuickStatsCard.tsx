import type { QuickStats } from "../types";
import { useNavigate } from "react-router-dom";

interface Performer {
  name: string;
  leads: number;
  conversion: string;
}

interface Props {
  stats: QuickStats;
}

export default function QuickStatsCard({ stats }: Props) {
  const performers: Performer[] = stats.top_performers || [];
  const navigate = useNavigate();

  return (
    <div className="flex w-full gap-6">
      {/* Top Performers — 70% */}
      <div
        className="w-[70%] bg-white rounded-2xl border p-6"
        style={{ boxShadow: "5px 3px 14.6px 0px #2D1A5340" }}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-[#2d1a53]">Top Performers</h3>
          <div className="flex gap-12 text-sm text-gray-300">
            <span>Lead Count</span>
            <span>Conversion%</span>
          </div>
        </div>

        <div className="divide-y divide-purple-100">
          {performers.map((p, idx) => (
            <div
              key={idx}
              className="grid grid-cols-[1fr_120px_120px] items-center py-4"
            >
              <div className="flex items-center gap-4">
                <div className="w-9 h-9 rounded-full bg-purple-200 text-purple-700 font-semibold flex items-center justify-center">
                  {p.name.charAt(0)}
                </div>
                <span className="font-medium text-[#2d1a53]">
                  {p.name}
                </span>
              </div>

              <div className="flex justify-center">
                <span className="px-4 py-1 rounded-full bg-purple-200 text-purple-700 text-xs font-semibold">
                  {p.leads}
                </span>
              </div>

              <div className="flex justify-center">
                <span className="px-4 py-1 rounded-full bg-purple-200 text-purple-700 text-xs font-semibold">
                  {p.conversion}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Action — 30% */}
      <div className="w-[30%] bg-purple-300/60 rounded-2xl p-6 text-[#2d1a53] space-y-4"  style={{ boxShadow: "5px 3px 14.6px 0px #2D1A5340" }}>
        <h3 className="font-semibold">Quick Action</h3>

        <ActionButton label="Add Campaign" onClick={() => navigate("/admin/campaigns?open=create")} />

         <ActionButton
        label="Add New Member"
        onClick={() => navigate("/admin/team?open=create")}
      />
        <ActionButton label="Import Products" />
      </div>
    </div>
  );
}

function ActionButton({ label, onClick }: { label: string; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full px-4 py-3 bg-white/50 hover:bg-white/70 rounded-xl text-left font-medium flex items-center gap-3 transition"
    >
      <span className="w-6 h-6 rounded-full bg-white text-purple-600 flex items-center justify-center font-bold">
        +
      </span>
      {label}
    </button>
  );
}

