import { Edit, Ban, Shield, AlertTriangle } from "lucide-react";
import type { TeamMember } from "../types";

type Props = {
  member: TeamMember;
  onClick?: () => void;          // 👉 navigate to details page
  onEdit: () => void;
  onPermissions: () => void;
  onSuspend: () => void;
};

export default function TeamMemberCard({
  member,
  onClick,
  onEdit,
  onPermissions,
  onSuspend,
}: Props) {
  const isPending = member.status === "pending";
  const isActive = member.status === "active";
  const isSuspended = member.status === "suspended";

  return (
    <div
      onClick={onClick}
      className="bg-white p-6 rounded-2xl shadow-md border hover:shadow-lg transition max-w-sm cursor-pointer"
    >
      {/* Top */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-purple-600 flex items-center justify-center text-xl font-semibold text-white shadow-md">
          {member.name.charAt(0)}
        </div>

        <div>
          <h3 className="text-lg font-semibold">{member.name}</h3>
          <p className="text-gray-500 text-sm">{member.email}</p>

          <div className="flex gap-2 mt-2 flex-wrap">
            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs">
              {member.role}
            </span>

            {isActive && (
              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs">
                Active
              </span>
            )}

            {isPending && (
              <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs">
                Pending
              </span>
            )}

            {isSuspended && (
              <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs">
                Suspended
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      {isActive && (
        <div className="mt-5 grid grid-cols-3 text-center">
          <div>
            <p className="font-semibold">{member.leads}</p>
            <p className="text-xs text-gray-500">Leads</p>
          </div>
          <div>
            <p className="font-semibold">{member.pipeline}</p>
            <p className="text-xs text-gray-500">Pipeline</p>
          </div>
          <div>
            <p className="font-semibold text-purple-600">
              {member.conversion}
            </p>
            <p className="text-xs text-gray-500">Conv.</p>
          </div>
        </div>
      )}

      {/* Pending Info */}
      {isPending && (
        <div className="bg-yellow-50 border border-yellow-100 text-yellow-700 text-sm px-4 py-3 rounded-lg mt-4 flex gap-2">
          <AlertTriangle size={16} />
          Pending Super Admin verification
        </div>
      )}

      {/* Footer */}
      <div className="flex justify-between text-xs text-gray-400 mt-4">
        <p>Joined {new Date(member.created_at).toLocaleDateString()}</p>
        <p>{member.lastActive ?? "Never active"}</p>
      </div>

      {/* Actions */}
      {(isActive || isSuspended) && (
        <div className="grid grid-cols-3 gap-3 mt-5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            disabled={isSuspended}
            className="border py-2 rounded-xl flex items-center justify-center gap-1 text-gray-700 disabled:opacity-50"
          >
            <Edit size={16} /> Edit
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onPermissions();
            }}
            disabled={isSuspended}
            className="border py-2 rounded-xl flex items-center justify-center gap-1 text-gray-700 disabled:opacity-50"
          >
            <Shield size={16} /> Permissions
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onSuspend();
            }}
            className={`border py-2 rounded-xl flex items-center justify-center gap-1 ${
              isActive
                ? "text-red-600 bg-red-50"
                : "text-green-600 bg-green-50"
            }`}
          >
            <Ban size={16} />
            {isActive ? "Suspend" : "Activate"}
          </button>
        </div>
      )}
    </div>
  );
}
