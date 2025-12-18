// components/details/TeamMemberOverviewTab.tsx
import type { TeamMember } from "../../types";
import { useAppSelector } from "../../../../app/hooks";
import { useNavigate } from "react-router-dom";

export default function TeamMemberOverviewTab({
  member,
}: {
  member: TeamMember;
}) {
  const navigate = useNavigate();

  const { items: campaigns, loading } = useAppSelector(
    (s) => s.campaigns
  );

  // Filter campaigns assigned to this member
  const assignedCampaigns = campaigns.filter(
    (c) =>
      c.assigned_to_id === member.id
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* ================= MEMBER DETAILS ================= */}
      <div className="bg-white border rounded-xl p-5 space-y-3">
        <h3 className="font-medium">Member Details</h3>

        <Detail label="Email" value={member.email} />
        <Detail label="Phone" value={member.phone} />
        <Detail label="Role" value={member.role} />
        <Detail label="Status" value={member.status} />
        <Detail label="Joined On" value={member.created_at} />
      </div>

      {/* ================= CAMPAIGNS ================= */}
      <div className="lg:col-span-2 bg-white border rounded-xl p-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium">
            Campaigns Assigned ({assignedCampaigns.length})
          </h3>

          <button
            onClick={() =>
              navigate(`/admin/campaigns?assignedTo=${member.id}`)
            }
            className="text-sm text-purple-600"
          >
            View all →
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-sm text-gray-500">
            Loading campaigns…
          </div>
        )}

        {/* Empty */}
        {!loading && assignedCampaigns.length === 0 && (
          <div className="text-sm text-gray-500">
            No campaigns assigned
          </div>
        )}

        {/* List */}
        {assignedCampaigns.length > 0 && (
          <div className="divide-y">
            {assignedCampaigns.map((c) => (
              <div
                key={c.id}
                onClick={() =>
                  navigate(`/admin/campaigns/${c.id}`)
                }
                className="py-3 cursor-pointer hover:bg-gray-50 rounded-md px-2"
              >
                <div className="font-medium">
                  {c.name}
                </div>

                <div className="text-xs text-gray-500 flex gap-4 mt-1">
                  <span>Status: {c.status}</span>
                  <span>
                    Budget: ₹
                    {c.budget?.toLocaleString() ?? "-"}
                  </span>
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
    <div className="text-sm">
      <div className="text-gray-500">{label}</div>
      <div>{value || "-"}</div>
    </div>
  );
}
