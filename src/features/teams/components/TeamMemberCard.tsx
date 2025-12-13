import { Edit, Ban, AlertTriangle } from "lucide-react";
import type { TeamMember } from "../types";

export default function TeamMemberCard({
  member,
  onEdit,
  onBan,
//   onPermissions,
}: {
  member: TeamMember;
  onEdit?: () => void;
  onBan?: () => void;
  onPermissions?: () => void;
}) {
  const isPending = member.status === "pending";
  const isActive = member.status === "active";

  return (
    <div className="bg-white p-6 rounded-2xl shadow-md border hover:shadow-lg transition max-w-sm">

      {/* Top Section */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-purple-600 flex items-center justify-center text-xl font-semibold text-white shadow-md">
          {member.name.charAt(0)}
        </div>

        <div>
          <h3 className="text-lg font-semibold">{member.name}</h3>
          <p className="text-gray-500 text-sm">{member.email}</p>

          <div className="flex gap-2 mt-2">
            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
              {member.role}
            </span>

            {isActive && (
              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
                Active
              </span>
            )}

            {isPending && (
              <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-medium">
                Pending
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Active Stats */}
      {isActive && (
        <div className="mt-5 grid grid-cols-3 text-center">
          <div>
            <p className="font-semibold text-lg">{member.leads}</p>
            <p className="text-gray-500 text-xs">Leads</p>
          </div>
          <div>
            <p className="font-semibold text-lg">{member.pipeline}K</p>
            <p className="text-gray-500 text-xs">Pipeline</p>
          </div>
          <div>
            <p className="font-semibold text-lg text-purple-600">
              {member.conversion}
            </p>
            <p className="text-gray-500 text-xs">Conv.</p>
          </div>
        </div>
      )}

      {/* Pending Notice */}
      {isPending && (
        <div className="bg-yellow-50 border border-yellow-100 text-yellow-700 text-sm px-4 py-3 rounded-lg mt-4 flex items-center gap-2">
          <AlertTriangle size={16} />
          Pending Super Admin verification
        </div>
      )}

      {/* Joined / Active */}
      <div className="flex justify-between items-center text-xs text-gray-400 mt-4">
        <p>Joined {new Date(member.created_at).toLocaleDateString()}</p>
        <p>{member.lastActive ? `Active ${member.lastActive}` : "Active Never"}</p>
      </div>

      {/* Active Action Buttons */}
      {isActive && (
        <div className="grid grid-cols-2 gap-3 mt-5">
          <button
            onClick={onEdit}
            className="border py-2 rounded-xl flex items-center justify-center gap-1 text-gray-700 hover:bg-gray-50 transition"
          >
            <Edit size={16} /> Edit
          </button>

          <button
            onClick={onBan}
            className="border py-2 rounded-xl flex items-center justify-center gap-1 text-red-600 bg-red-50 hover:bg-red-100 transition"
          >
            <Ban size={16} /> Ban
          </button>
        </div>
      )}
    </div>
  );
}
