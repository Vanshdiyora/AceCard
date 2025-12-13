import { Search, Filter, Download } from "lucide-react";

export default function LeadFilters({ search, setSearch }: any) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative w-80">
        <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search leads..."
          className="w-full border rounded-lg py-2.5 pl-10 pr-4 text-sm"
        />
      </div>

      <button className="border rounded-lg px-4 py-2 text-sm bg-white">
        All Stages ▼
      </button>

      <button className="border rounded-lg px-4 py-2 flex items-center gap-2 text-sm bg-white">
        <Filter size={16} />
        More Filters
      </button>

      <button className="border rounded-lg px-4 py-2 flex items-center gap-2 text-sm bg-white">
        <Download size={16} />
        Export
      </button>
    </div>
  );
}
