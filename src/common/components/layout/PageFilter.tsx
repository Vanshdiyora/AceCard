import { Filter, Download, Search, Upload } from "lucide-react";

export interface TabItem {
  label: string;
  value: string;
}

export interface PageFiltersProps {
  tabs?: TabItem[];
  activeTab?: string;
  onTabChange?: (v: string) => void;

  searchPlaceholder?: string;
  onSearch?: (value: string) => void;

  onFilter?: () => void;
  onExport?: () => void;
  onImport?: () => void; // ✅ Added
}

export default function PageFilters({
  tabs = [],
  activeTab,
  onTabChange,

  searchPlaceholder = "Search...",
  onSearch,

  onFilter,
  onExport,
  onImport, // ✅ Added
}: PageFiltersProps) {
  return (
    <div className="bg-white p-5 rounded-2xl border space-y-4">

      {/* Tabs */}
      {tabs.length > 0 && (
        <div className="flex gap-3 border-b pb-3">
          {tabs.map((t) => (
            <button
              key={t.value}
              onClick={() => onTabChange?.(t.value)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium ${
                activeTab === t.value
                  ? "bg-purple-100 text-purple-700"
                  : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      {/* Search + Buttons */}
      <div className="flex justify-between items-center">
        {/* LEFT: Search */}
        <div className="relative w-1/3 min-w-[200px]">
          <Search size={18} className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            onChange={(e) => onSearch?.(e.target.value)}
            className="w-full border rounded-lg px-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 shadow-sm"
          />
        </div>

        {/* RIGHT: Buttons */}
        <div className="flex items-center gap-3">
          {onFilter && (
            <button
              onClick={onFilter}
              className="flex items-center gap-2 px-4 py-2 border rounded-lg text-sm bg-white hover:bg-gray-100 shadow-sm"
            >
              <Filter size={16} /> Filter
            </button>
          )}

          {onImport && (
            <button
              onClick={onImport}
              className="flex items-center gap-2 px-4 py-2 border rounded-lg text-sm bg-white hover:bg-gray-100 shadow-sm"
            >
              <Upload size={16} /> Import
            </button>
          )}

          {onExport && (
            <button
              onClick={onExport}
              className="flex items-center gap-2 px-4 py-2 border rounded-lg text-sm bg-white hover:bg-gray-100 shadow-sm"
            >
              <Download size={16} /> Export
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
