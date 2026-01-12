import { useEffect, useState } from "react";
import type { TeamPermissions } from "../types";

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

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl w-96 shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Update Permissions</h2>

        <div className="space-y-2">
          {visibleKeys.map((key) => (
            <label key={key} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form[key]}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    [key]: e.target.checked,
                  }))
                }
              />
              {key.replace(/_/g, " ")}
            </label>
          ))}
        </div>

        <div className="flex justify-end gap-2 mt-5">
          <button
            type="button"
            className="px-4 py-2 border rounded"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            type="button"
            className="px-4 py-2 bg-purple-600 text-white rounded"
            onClick={() => onSubmit(form)}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
