import { Plus } from "lucide-react";

export interface PageHeaderProps {
  title?: string;
  description?: string;
  addButtonLabel?: string;
  onAdd?: () => void;
}

export default function PageHeader({
  title,
  description,
  addButtonLabel = "Add",
  onAdd,
}: PageHeaderProps) {
  return (
    <div className="w-full flex justify-between items-center mb-4">
      <div>
        {title && <h1 className="text-3xl font-bold">{title}</h1>}
        {description && <p className="text-gray-500 mt-1">{description}</p>}
      </div>

      {onAdd && (
        <button
          onClick={onAdd}
          className="flex items-center gap-2 px-4 py-2 text-white bg-purple-600 hover:bg-purple-700 rounded-lg text-sm"
        >
          <Plus size={18} /> {addButtonLabel}
        </button>
      )}
    </div>
  );
}
