import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import StatsGrid from "../../../common/components/cards/StatsGrid";
import { Users, Crown, UserCheck, TrendingUp } from "lucide-react";


import {
    fetchTeam,
    createMember,
    updateMember,
    updatePermissions,
    suspendMember,
} from "../slice";

import TeamMemberCard from "../components/TeamMemberCard";
import AddMemberModal from "../components/AddMemberModal";
import EditMemberModal from "../components/EditMemberModal";
import PermissionsModal from "../components/PermissionsModal";
import SuspendMemberModal from "../components/SuspendMemberModal";

import PageHeader from "../../../common/components/layout/PageHeader";
import PageFilters from "../../../common/components/layout/PageFilter";

export default function TeamPage() {
    const dispatch = useAppDispatch();
    const { members } = useAppSelector((s) => s.team);

    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("all");

    const [addOpen, setAddOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [permOpen, setPermOpen] = useState(false);
    const [suspendOpen, setSuspendOpen] = useState(false);

    const [selected, setSelected] = useState<any>(null);

    useEffect(() => {
        dispatch(fetchTeam());
    }, []);

    const filtered = members.filter((m) => {
        if (filter !== "all" && m.role !== filter) return false;
        if (!m.name.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    });

    return (
        <div className="p-6 space-y-6">

            {/* Page Header */}
            <PageHeader
                title="Team"
                description="Manage your team members"
                addButtonLabel="Invite Member"
                onAdd={() => setAddOpen(true)}
            />

            {/* Stats Section */}
            <StatsGrid
                items={[
                    {
                        title: "Total Members",
                        value: members.length,
                        icon: <Users size={20} />,
                    },
                    {
                        title: "Managers",
                        value: members.filter((m) => m.role === "manager").length,
                        icon: <Crown size={20} className="text-orange-500" />,
                    },
                    {
                        title: "Sales Reps",
                        value: members.filter((m) => m.role === "sales_rep").length,
                        icon: <UserCheck size={20} />,
                    },
                    {
                        title: "Avg. Conversion",
                        value: "11.9%",
                        icon: <TrendingUp size={20} className="text-orange-500" />,
                    },
                ]}
            />

            {/* Filters */}
            <PageFilters
                tabs={[
                    { label: "All", value: "all" },
                    { label: "Manager", value: "manager" },
                    { label: "Salesperson", value: "sales_rep" },
                    { label: "Active", value: "active" },
                    { label: "Suspended", value: "suspended" },
                ]}
                activeTab={filter}
                onTabChange={setFilter}
                onSearch={(v) => setSearch(v)}
            />

            {/* Members Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-4">
                {filtered.map((m) => (
                    <TeamMemberCard
                        key={m.id}
                        member={m}

                        // Active → Edit
                        onEdit={() => {
                            setSelected(m);
                            setEditOpen(true);
                        }}

                        // Staff permissions
                        onPermissions={() => {
                            setSelected(m);
                            setPermOpen(true);
                        }}

                        // Active → Ban
                        onBan={() => {
                            setSelected(m);
                            setSuspendOpen(true);
                        }}
                    />

                ))}
            </div>

            {/* Modals */}
            <AddMemberModal
                open={addOpen}
                onClose={() => setAddOpen(false)}
                onSubmit={(data) => {
                    dispatch(createMember(data));
                    setAddOpen(false);
                }}
            />

            <EditMemberModal
                open={editOpen}
                member={selected}
                onClose={() => setEditOpen(false)}
                onSubmit={(data) => {
                    dispatch(updateMember({ id: selected.id, data }));
                    setEditOpen(false);
                }}
            />

            <PermissionsModal
                open={permOpen}
                permissions={selected?.permissions}
                onClose={() => setPermOpen(false)}
                onSubmit={(data) => {
                    dispatch(updatePermissions({ id: selected.id, data }));
                    setPermOpen(false);
                }}
            />

            <SuspendMemberModal
                open={suspendOpen}
                name={selected?.name}
                onClose={() => setSuspendOpen(false)}
                onConfirm={() => {
                    dispatch(suspendMember(selected.id));
                    setSuspendOpen(false);
                }}
            />
        </div>
    );
}
