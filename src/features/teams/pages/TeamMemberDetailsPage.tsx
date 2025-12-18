// pages/TeamMemberDetailsPage.tsx
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { ArrowLeft, Edit, Shield, UserX } from "lucide-react";

import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { updateMember, fetchMemberById } from "../slice";

import EditMemberModal from "../components/EditMemberModal";
import PermissionsModal from "../components/PermissionsModal";

import TeamMemberOverviewTab from "../components/details/TeamMemberOverviewTab";
import TeamMemberLeadsTab from "../components/details/TeamMemberLeadsTab";

const TABS = ["overview", "leads"] as const;

export default function TeamMemberDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [activeTab, setActiveTab] =
    useState<typeof TABS[number]>("overview");

  const [editOpen, setEditOpen] = useState(false);
  const [permOpen, setPermOpen] = useState(false);

  const { members, loading } = useAppSelector((s) => s.team);
  const member = members.find((m) => m.id === Number(id));

  // ✅ FETCH ON REFRESH / DIRECT URL
  useEffect(() => {
    if (id) {
      dispatch(fetchMemberById(Number(id)));
    }
  }, [id, dispatch]);

  // ✅ Loading state
  if (loading) {
    return <div className="p-6 text-gray-500">Loading member…</div>;
  }

  // ✅ Not found (after fetch)
  if (!member) {
    return <div className="p-6">Member not found</div>;
  }

  const suspend = async () => {
    if (confirm("Suspend this member?")) {
      dispatch(
        updateMember({
          id: member.id,
          data: { status: "inactive" },
        })
      );
      navigate(-1);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-black"
      >
        <ArrowLeft size={16} />
        Back to Team
      </button>

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold">{member.name}</h2>
          <p className="text-gray-500">
            {member.role} • {member.status}
          </p>
        </div>

        <div className="flex gap-2">
          <button onClick={() => setEditOpen(true)} className="btn-outline">
            <Edit size={16} /> Edit
          </button>

          <button onClick={() => setPermOpen(true)} className="btn-outline">
            <Shield size={16} /> Permissions
          </button>

          {member.status === "active" && (
            <button onClick={suspend} className="btn-danger">
              <UserX size={16} /> Suspend
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b text-sm">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`pb-2 capitalize ${
              activeTab === t
                ? "border-b-2 border-purple-600 text-purple-600 font-medium"
                : "text-gray-500"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <TeamMemberOverviewTab member={member} />
      )}
      {activeTab === "leads" && (
        <TeamMemberLeadsTab memberId={member.id} />
      )}

      {/* Modals */}
      <EditMemberModal
        open={editOpen}
        member={member}
        onClose={() => setEditOpen(false)}
        onSubmit={(data) => {
          dispatch(updateMember({ id: member.id, data }));
          setEditOpen(false);
        }}
      />

      <PermissionsModal
        open={permOpen}
        permissions={member.permissions}
        onClose={() => setPermOpen(false)}
        onSubmit={(data) => {
          dispatch({
            type: "team/permissions",
            payload: { id: member.id, data },
          });
          setPermOpen(false);
        }}
      />
    </div>
  );
}
