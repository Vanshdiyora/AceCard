import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";

import {
  fetchLeads,
  createLead,
  updateLead,
  archiveLead,
} from "../slice";

import PageHeader from "../../../common/components/layout/PageHeader";
import PageFilters, { type TabItem } from "../../../common/components/layout/PageFilter";

import LeadRow from "../components/LeadRow";
import AddLeadModal from "../components/AddLeadModal";
import EditLeadModal from "../components/EditLeadModal";
import type { Lead } from "../types";

// Tabs
const tabs: TabItem[] = [
  { label: "All Leads", value: "all" },
  { label: "My Leads", value: "mine" },
  { label: "Hot Leads", value: "hot" },
  { label: "New This Week", value: "new_week" },
  { label: "Needs Follow-up", value: "follow_up" },
];

export default function LeadsPage() {
  const dispatch = useAppDispatch();
  const { leads } = useAppSelector((s) => s.leads);

  const [activeTab, setActiveTab] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  useEffect(() => {
    dispatch(fetchLeads());
  }, []);

  // Filtering Logic
  const filteredLeads = leads.filter((l) => {
    const matchesSearch =
      l.lead_name.toLowerCase().includes(search.toLowerCase()) ||
      l.company.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === "hot") return l.stage === "hot";

    if (activeTab === "new_week") {
      const diffDays =
        (new Date().getTime() - new Date(l.created_at).getTime()) /
        (1000 * 60 * 60 * 24);
      return diffDays <= 7;
    }

    if (activeTab === "follow_up") {
      const diffDays =
        (new Date().getTime() - new Date(l.last_interaction_at).getTime()) /
        (1000 * 60 * 60 * 24);
      return diffDays > 3;
    }

    return true;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <PageHeader
        title="Leads"
        description="Manage and track your leads"
        addButtonLabel="Add Lead"
        onAdd={() => setAddOpen(true)}
      />

      {/* Tabs + Search + Filter/Export */}
      <PageFilters
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={(v) => setActiveTab(v)}
        searchPlaceholder="Search leads..."
        onSearch={(value) => setSearch(value)}
        onFilter={() => console.log("Filter action")}
        onExport={() => console.log("Export action")}
      />

      {/* Table */}
      <div className="bg-white rounded-xl border shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-gray-50 text-left text-sm text-gray-600">
              <th className="py-3 px-4">Name</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Owner</th>
              <th className="py-3 px-4">Product</th>
              <th className="py-3 px-4">Stage</th>
              <th className="py-3 px-4">Updated At</th>
              <th className="py-3 px-4"></th>
            </tr>
          </thead>

          <tbody>
            {filteredLeads.map((lead) => (
              <LeadRow
                key={lead.id}
                lead={lead}
                onEdit={() => {
                  setSelectedLead(lead);
                  setEditOpen(true);
                }}
                onArchive={() => dispatch(archiveLead(lead.id))}
              />
            ))}

            {filteredLeads.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-6 text-gray-500">
                  No leads found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Lead Modal */}
      <AddLeadModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSubmit={(data: any) => {
          dispatch(createLead(data));
          setAddOpen(false);
        }}
      />

      {/* Edit Lead Modal */}
      <EditLeadModal
        open={editOpen}
        lead={selectedLead}
        onClose={() => setEditOpen(false)}
        onSubmit={(data: any) => {
          if (!selectedLead) return;
          dispatch(updateLead({ id: selectedLead.id, data }));
          setEditOpen(false);
        }}
      />
    </div>
  );
}
