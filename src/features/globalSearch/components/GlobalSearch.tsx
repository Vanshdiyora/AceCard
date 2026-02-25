import { useEffect, useRef, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X } from "lucide-react";
import { useDebounce } from "../../../common/hooks/useDebounce";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { fetchGlobalSearch, clearResults } from "../slice";
import { selectResults, selectLoading } from "../selectors";
import type { GlobalSearchItem } from "../types";
import { searchVendors } from "../../vendors/slice";
// import type { VendorItem } from "../../vendors/types";

type GlobalSearchProps = {
  mode: "admin" | "super_admin";
};

export default function GlobalSearch({ mode }: GlobalSearchProps) {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const debouncedQuery = useDebounce(query, 300);

  // 🔹 Global search (admin)
  const globalResults = useAppSelector(selectResults);
  const globalLoading = useAppSelector(selectLoading);

  // 🔹 Vendor search (super admin)
// ✅ CORRECT (search state)
const vendors = useAppSelector((s) => s.vendors.searchResults);
const vendorLoading = useAppSelector((s) => s.vendors.searchLoading);


  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  /* ---------- SEARCH EFFECT ---------- */
  useEffect(() => {
    if (!debouncedQuery) {
      dispatch(clearResults());
      setActiveIndex(0);
      return;
    }

    if (mode === "super_admin") {
      dispatch(
       searchVendors({
  page: 1,
  page_size: 10,
  q: debouncedQuery
})
      );
    } else {
      dispatch(fetchGlobalSearch({ query: debouncedQuery, mode }));
    }

    setActiveIndex(0);
  }, [debouncedQuery, mode, dispatch]);

  /* ---------- NORMALIZED RESULTS ---------- */
  const results: GlobalSearchItem[] = useMemo(() => {
  if (mode === "super_admin") {
    return vendors.map((v) => ({
      id: v.id, // ✅ FIX
      label: v.legal_name,
      type: "vendor",
      route: `/admin/vendors/${v.id}`,
    }));
  }

  return globalResults;
}, [mode, vendors, globalResults]);


  const loading = mode === "super_admin" ? vendorLoading : globalLoading;

  /* ---------- HANDLERS ---------- */
  const handleSelect = (item: GlobalSearchItem) => {
    setQuery("");
    setActiveIndex(0);
    (document.activeElement as HTMLElement | null)?.blur();
    navigate(item.route);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!results.length) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, results.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
        break;
      case "Enter":
        e.preventDefault();
        handleSelect(results[activeIndex]);
        break;
      case "Escape":
        setQuery("");
        setActiveIndex(0);
        break;
    }
  };

  /* ---------- UI ---------- */
  return (
    <div className="relative">
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          size={18}
        />

        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search ..."
          className="w-full pl-10 pr-10 py-2 border rounded-xl focus:ring-2 focus:ring-purple-600"
        />

        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {query && (
        <div className="absolute z-50 mt-1 w-full bg-white border rounded-md shadow max-h-80 overflow-y-auto">
          {loading ? (
            <div className="px-4 py-3 text-sm text-gray-500">
              Searching…
            </div>
          ) : results.length === 0 ? (
            <div className="px-4 py-3 text-sm text-gray-500">
              No results
            </div>
          ) : (
            results.map((item, i) => (
              <div
                key={i}
                ref={(el) => {
                  itemRefs.current[i] = el;
                }}
                onMouseEnter={() => setActiveIndex(i)}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelect(item);
                }}
                className={`px-4 py-2 cursor-pointer flex justify-between ${
                  i === activeIndex
                    ? "bg-blue-100"
                    : "hover:bg-gray-100"
                }`}
              >
                <span>{item.label}</span>
                <span className="text-xs uppercase text-gray-500">
                  {item.type}
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
