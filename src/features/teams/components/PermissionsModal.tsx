import { useEffect, useState } from "react";
import type { TeamPermissions } from "../types";
import { Check } from "lucide-react";

const ALL_KEYS: (keyof TeamPermissions)[] = [
  "manage_team",
  "manage_products",
  "manage_campaigns",
  "view_leads",
  "edit_leads",
  "archive_leads",
  "send_notifications",
  "view_analytics",
];

const ROLE_PERMISSION_MAP: Record<
  "manager" | "sales_rep",
  (keyof TeamPermissions)[]
> = {
  manager: ALL_KEYS,
  sales_rep: ["view_leads", "edit_leads", "archive_leads"],
};

const EMPTY_PERMISSIONS: TeamPermissions = {
  manage_team: false,
  manage_products: false,
  manage_campaigns: false,
  view_leads: true,
  edit_leads: true,
  archive_leads: true,
  send_notifications: false,
  view_analytics: false,
};

const LABELS: Record<keyof TeamPermissions, string> = {
  manage_team: "Manage team",
  manage_products: "Manage products",
  manage_campaigns: "Manage campaigns",
  view_leads: "View leads",
  edit_leads: "Edit leads",
  archive_leads: "Archive leads",
  send_notifications: "Send notifications",
  view_analytics: "View analytics",
};

export default function PermissionsModal({
  open,
  permissions,
  role,
  onClose,
  onSubmit,
}: {
  open: boolean;
  permissions: Partial<TeamPermissions>;
  role: "manager" | "sales_rep" | string;
  onClose: () => void;
  onSubmit: (data: TeamPermissions) => void;
}) {
  const visibleKeys =
    ROLE_PERMISSION_MAP[role as "manager" | "sales_rep"] ?? [];

  const [form, setForm] = useState<TeamPermissions>(EMPTY_PERMISSIONS);

  useEffect(() => {
    if (open) {
      setForm({
        ...EMPTY_PERMISSIONS,
        ...permissions,
      });
    }
  }, [open, permissions]);

  if (!open) return null;

  const toggle = (key: keyof TeamPermissions) => {
    setForm((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-[420px] rounded-3xl shadow-xl overflow-hidden">

        {/* HEADER */}
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">Update Permissions</h2>
        </div>

        {/* LIST */}
        <div className="divide-y">

          {visibleKeys.map((key) => {
            const active = form[key];

            return (
              <button
                key={key}
                onClick={() => toggle(key)}
                className="group w-full flex items-center gap-4 px-6 py-4 text-left hover:bg-gray-50 transition"
              >
                {/* CIRCLE ICON */}
                {active ? (
                  <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                    <Check size={14} className="text-white" />
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded-full border-2 border-dashed border-gray-300 group-hover:border-yellow-500 transition" />
                )}

                {/* TEXT */}
                <span
                  className={`text-sm ${
                    active ? "text-gray-400" : "text-gray-900"
                  }`}
                >
                  {LABELS[key]}
                </span>
              </button>
            );
          })}

        </div>

        {/* ACTIONS */}
        <div className="flex justify-end gap-2 p-4 border-t">
          <button
            className="px-4 py-2 text-sm border rounded-lg"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            className="px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            onClick={() => onSubmit(form)}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}