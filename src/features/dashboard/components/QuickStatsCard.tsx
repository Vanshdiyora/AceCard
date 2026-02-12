import { formatRupees } from "../../../common/utils/ruppeeFormater";
import type { TopPerformer } from "../types";
import { useNavigate } from "react-router-dom";

interface Props {
  topPerformers?: TopPerformer[] | null;
}

export default function QuickStatsCard({ topPerformers }: Props) {
  const navigate = useNavigate();
  const list = topPerformers ?? [];
  return (
    <div className="flex flex-col gap-6 w-full h-full max-h-full">
      {/* Top Performers */}
      <div
        className="bg-white rounded-2xl border p-6"
        style={{ boxShadow: "2px 2px 3px 0px #2D1A5340" }}
      >
        {/* Header */}
        <div className="grid grid-cols-[48px_2fr_96px_72px] items-center mb-4 text-sm text-gray-400">
          <span className="text-center">#</span>
          <span>Name</span>
          <span className="text-center">Revenue</span>
          <span className="text-center">Leads</span>
        </div>

        <div className="divide-y divide-purple-100">
          {list.length === 0 ? (
            <div className="py-10 text-center text-sm text-gray-400">
              No top performers yet
            </div>
          ) : (
            list.map((p, idx) => (
              <div
                key={idx}
                className="grid grid-cols-[48px_2fr_96px_72px] items-center py-4 text-sm"
              >
                {/* Rank */}
                <div className="flex justify-center">
                  <span
                    className={`w-7 h-7 rounded-full flex items-center justify-center font-semibold text-xs
                ${idx === 0
                        ? "bg-yellow-400 text-yellow-900"
                        : idx === 1
                          ? "bg-gray-300 text-gray-800"
                          : idx === 2
                            ? "bg-orange-400 text-orange-900"
                            : "bg-purple-200 text-purple-700"
                      }`}
                  >
                    {idx + 1}
                  </span>
                </div>

                {/* Name */}
                <span className="font-medium text-[#2d1a53] truncate">
                  {p.name}
                </span>

                {/* Revenue */}
                <div className="flex justify-center">
                  <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                    {formatRupees(p.revenue)}
                  </span>
                </div>

                {/* Leads */}
                <div className="flex justify-center">
                  <span className="px-3 py-1 rounded-full bg-purple-200 text-purple-700 text-xs font-semibold">
                    {p.lead_count}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>


      {/* Quick Actions */}
      <div
        className="bg-purple-300/60 rounded-2xl p-6 text-[#2d1a53] space-y-4"
        style={{ boxShadow: "2px 2px 3px 0px #2D1A5340" }}
      >
        <h3 className="font-semibold">Quick Action</h3>

        <ActionButton
          label="Add Campaign"
          onClick={() => navigate("/admin/campaigns?open=create")}
        />
        <ActionButton
          label="Add New Member"
          onClick={() => navigate("/admin/team?open=create")}
        />
        <ActionButton
          label="Import Products"
          onClick={() => navigate("/admin/products?open=import")}
        />
      </div>
    </div>
  );
}

function ActionButton({
  label,
  onClick,
}: {
  label: string;
  onClick?: () => void;
}) {
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
