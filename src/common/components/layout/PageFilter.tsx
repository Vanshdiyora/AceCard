import { useState, useRef, useEffect } from "react";
import { Filter, Download, Search, Upload } from "lucide-react";

/* ---------------- TYPES ---------------- */

export interface TabItem {
  label: string;
  value: string;
}

export interface FilterConfig {
  key: string;
  title?: string; // 👈 ADD
  placeholder: string;
  value?: string;
  onChange?: (v: string) => void;
  options: { label: string; value: string }[];
}


export interface PageFiltersProps {
  tabs?: TabItem[];
  activeTab?: string;
  onTabChange?: (v: string) => void;

  searchPlaceholder?: string;
  onSearch?: (value: string) => void;

  filters?: FilterConfig[];

  onExport?: () => void;
  onImport?: () => void;
  disableExport?: boolean; // optional
  rightSlot?: React.ReactNode;
}

/* ---------------- COMPONENT ---------------- */

export default function PageFilters({
  tabs = [],
  activeTab,
  onTabChange,

  searchPlaceholder = "Search...",
  onSearch,

  filters = [],

  onExport,
  onImport,
  disableExport = false,
  rightSlot
}: PageFiltersProps) {
  const [panelOpen, setPanelOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const [searchValue, setSearchValue] = useState("");
  const debounceRef = useRef<number | undefined>(undefined);

  /* -------- Outside click -------- */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!panelRef.current?.contains(e.target as Node)) {
        setPanelOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* -------- Debounced search -------- */
  useEffect(() => {
    if (!onSearch) return;

    window.clearTimeout(debounceRef.current);

    debounceRef.current = window.setTimeout(() => {
      onSearch(searchValue);
    }, 400);

    return () => window.clearTimeout(debounceRef.current);
  }, [searchValue, onSearch]);

  /* ---------------- RENDER ---------------- */

  return (
    <div className="space-y-5">
      {/* Tabs */}
      {tabs.length > 0 && (
        <div className="flex items-center gap-3">
          {/* Tabs */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {tabs.map((t) => {
              const active = activeTab === t.value;
              return (
                <button
                  key={t.value}
                  onClick={() => onTabChange?.(t.value)}
                  className={`px-3 py-1.5 lg:px-4 lg:py-2 rounded-full text-xs lg:text-sm font-medium transition shadow-sm ${active
                    ? "bg-[#D8B4FE] text-[#5e1b98]"
                    : "bg-white text-gray-600 hover:bg-gray-100"
                    }`}
                >
                  {t.label}
                </button>
              );
            })}
          </div>

          {/* Right slot */}
          <div className="ml-auto">
            {rightSlot}
          </div>
        </div>
      )}


      {/* Search + Filter Bar */}
      <div className="bg-white rounded-3xl shadow-md border p-4 lg:p-5 flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:flex-wrap lg:flex-nowrap gap-3 items-start md:items-center">
          {/* Search */}
          <div className="relative w-full md:w-[360px] lg:w-[420px]">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  window.clearTimeout(debounceRef.current);
                  onSearch?.(searchValue);
                }
              }}
              className="w-full pl-11 pr-4 py-2.5 lg:py-3 rounded-2xl border bg-gray-50 text-xs lg:text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
            />
          </div>

          {/* Filter Trigger */}
          {filters.length > 0 && (
            <div className="relative" ref={panelRef}>
              <button
                onClick={() => setPanelOpen((v) => !v)}
                className={`flex items-center gap-2 px-3 py-2 lg:px-4 lg:py-2.5 rounded-xl border text-xs lg:text-sm transition shadow-sm ${panelOpen
                  ? "bg-purple-600 text-white"
                  : "bg-white hover:bg-gray-50"
                  }`}
              >
                <Filter size={16} />
                Filter
              </button>

              {panelOpen && (
                <div className="absolute z-50 mt-2 right-0 bg-white border rounded-2xl shadow-xl p-2 min-w-[220px]">
                  {filters.map((f) => (
                    <div key={f.key} className="flex flex-col">
                      {f.title && (
                        <p className="px-4 pt-2 pb-1 text-xs font-semibold text-gray-400 uppercase">
                          {f.title}
                        </p>
                      )}
                      {f.options.map((opt) => {
                        const active = opt.value === f.value;
                        return (
                          <button
                            key={opt.value}
                            onClick={() => {
                              f.onChange?.(opt.value);
                              setPanelOpen(false);
                            }}
                            className={`text-left px-4 py-2.5 rounded-xl text-sm transition ${active
                              ? "bg-purple-50 text-purple-700 font-medium"
                              : "hover:bg-gray-50 text-gray-700"
                              }`}
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-2 ml-auto">
            {onImport && (
              <button
                onClick={onImport}
                className="flex items-center gap-2 px-3 py-2 lg:px-4 lg:py-2.5 rounded-xl border bg-white hover:bg-gray-50 text-xs lg:text-sm shadow-sm"
              >
                <Upload size={16} />
                Import
              </button>
            )}

            {onExport && (
              <button
                onClick={onExport}
                disabled={disableExport}
                className={`flex items-center gap-2 px-3 py-2 lg:px-4 lg:py-2.5 rounded-xl border text-xs lg:text-sm shadow-sm ${disableExport
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white hover:bg-gray-50"
                  }`}
              >
                <Download size={16} />
                Export
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
