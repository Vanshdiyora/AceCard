import { Plus } from "lucide-react";
import type { ReactNode } from "react";

export interface PageHeaderProps {
  title?: string;
  description?: string;
  addButtonLabel?: string;
  onAdd?: () => void;

  /** NEW: optional extra actions (buttons, dropdowns, etc.) */
  actions?: ReactNode;
}

export default function PageHeader({
  title,
  description,
  addButtonLabel = "Add",
  onAdd,
  actions,
}: PageHeaderProps) {
  return (
    <div className="w-full flex justify-between items-center mb-4">
      {/* Left */}
      <div>
        {title && <h1 className="text-3xl font-bold">{title}</h1>}
        {description && (
          <p className="text-gray-500 mt-1">{description}</p>
        )}
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {actions}

        {onAdd && (
          <button
            onClick={onAdd}
            className="flex items-center font-medium gap-2 px-4 py-2 text-[#5e1b98] bg-[#D8B4FE] hover:bg-[#C084FC] rounded-xl text-sm"
          >
            <Plus size={18} /> {addButtonLabel}
          </button>
        )}
      </div>
    </div>
  );
}
