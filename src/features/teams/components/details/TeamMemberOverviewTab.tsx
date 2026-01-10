import type { TeamMember } from "../../types";
import { useAppDispatch, useAppSelector } from "../../../../app/hooks";
import { useNavigate } from "react-router-dom";
import { useEffect, useMemo } from "react";
import { fetchCampaignsByTeamMember } from "../../../campaigns/slice";

export default function TeamMemberOverviewTab({
  member,
}: {
  member: TeamMember;
}) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { items, loading } = useAppSelector((s) => s.campaigns);
  const allCampaigns = items ?? [];

  useEffect(() => {
    if (member?.id && member.role !== "manager") {
      dispatch(fetchCampaignsByTeamMember({ memberId: member.id }));
    }
  }, [member.id, member.role, dispatch]);

  const campaigns = useMemo(() => {
    if (member.role === "manager") {
      return allCampaigns.filter(
        (c) => c.manager_id === member.id
      );
    }

    return allCampaigns;
  }, [allCampaigns, member.role, member.id]);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-6">

      {/* ================= MEMBER DETAILS ================= */}
      <div className="bg-white rounded-2xl border p-6 space-y-5">

        <h3 className="text-base font-semibold">Member Details</h3>

        <div className="space-y-4">
          <Detail label="Email" value={member.email} />
          <Detail label="Phone" value={member.phone} />
          <Detail label="Role" value={member.role.replace("_", " ")} />
          <Detail label="Status" value={member.status} />
          <Detail label="Joined On" value={member.created_at} />
        </div>

      </div>

      {/* ================= CAMPAIGNS ================= */}
      <div className="xl:col-span-2 bg-white rounded-2xl border p-6">

        <div className="flex justify-between items-center mb-5">
          <div>
            <h3 className="text-base font-semibold">
              Campaigns Assigned
              <span className="ml-2 text-sm text-gray-400">
                ({campaigns.length})
              </span>
            </h3>
            <p className="text-sm text-gray-500">
              Campaigns this member is involved in
            </p>
          </div>

          <button
            onClick={() =>
              navigate(`/admin/campaigns?teams_member_ids=${member.id}`)
            }
            className="text-sm text-purple-600 hover:underline"
          >
            View all →
          </button>
        </div>

        {loading && (
          <div className="py-8 text-sm text-gray-500">
            Loading campaigns…
          </div>
        )}

        {!loading && campaigns.length === 0 && (
          <div className="py-8 text-sm text-gray-500">
            No campaigns assigned
          </div>
        )}

        {campaigns.length > 0 && (
          <div className="space-y-3">
            {campaigns.map((c) => (
              <div
                key={c.id}
                onClick={() =>
                  navigate(`/admin/campaigns/${c.id}`)
                }
                className="p-4 rounded-xl border hover:border-purple-300 hover:bg-purple-50/40 cursor-pointer transition"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium text-sm">{c.name}</div>

                    <div className="flex gap-3 mt-1 text-xs text-gray-500">
                      <span className="capitalize">
                        {c.status}
                      </span>
                      <span>
                        Budget: ₹{c.budget?.toLocaleString() ?? "-"}
                      </span>
                    </div>
                  </div>

                  <span className="text-xs text-gray-400">→</span>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-xs uppercase tracking-wide text-gray-400">
        {label}
      </span>
      <span className="text-sm font-medium text-gray-900">
        {value || "-"}
      </span>
    </div>
  );
}
