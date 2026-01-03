import {
  useMemo,
  useState,
  useRef,
  useEffect,
} from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../../../app/hooks";
import {
  makeAdminGlobalSearchSelector,
  makeSuperGlobalSearchSelector,
} from "./selectors";
import type { GlobalSearchItem, GlobalSearchType } from "./types";
import { useDebounce } from "../../../common/hooks/useDebounce";
import { Search, X } from "lucide-react";

const GROUP_LABELS: Partial<Record<GlobalSearchType, string>> = {
  campaign: "Campaigns",
  lead: "Leads",
  team: "Team",
  product: "Products",
  vendor: "Vendors",
};

type GlobalSearchProps = {
  mode: "admin" | "super_admin";
};

export default function GlobalSearch({ mode }: GlobalSearchProps) {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const navigate = useNavigate();
  const debouncedQuery = useDebounce(query, 300);
  const isSearching = query !== debouncedQuery;

  const listRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  /* ================= SELECTOR ================= */

  const selector = useMemo(
    () =>
      mode === "super_admin"
        ? makeSuperGlobalSearchSelector(debouncedQuery)
        : makeAdminGlobalSearchSelector(debouncedQuery),
    [debouncedQuery, mode]
  );

  const groupedResults = useAppSelector(selector);

  /* ================= FLATTEN ================= */

  const flatResults = useMemo(
    () =>
      Object.values(groupedResults)
        .filter(Boolean)
        .flat(),
    [groupedResults]
  );

  /* ================= INDEX RESULTS ================= */

  const indexedResults = useMemo(() => {
    let index = 0;

    return Object.entries(groupedResults).map(([group, items]) => ({
      group: group as GlobalSearchType,
      items: (items ?? []).map(item => ({
        ...item,
        __index: index++,
      })),
    }));
  }, [groupedResults]);

  /* ================= AUTO SCROLL ================= */

  useEffect(() => {
    const el = itemRefs.current[activeIndex];
    if (el) {
      el.scrollIntoView({
        block: "nearest",
        behavior: "smooth",
      });
    }
  }, [activeIndex]);

  /* ================= HANDLERS ================= */

  const handleSelect = (item: GlobalSearchItem) => {
    navigate(item.route);
    setQuery("");
    setActiveIndex(0);
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (!flatResults.length) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex(i =>
          Math.min(i + 1, flatResults.length - 1)
        );
        break;

      case "ArrowUp":
        e.preventDefault();
        setActiveIndex(i => Math.max(i - 1, 0));
        break;

      case "Enter":
        e.preventDefault();
        handleSelect(flatResults[activeIndex]);
        break;

      case "Escape":
        setQuery("");
        setActiveIndex(0);
        break;
    }
  };

  /* ================= RENDER ================= */

  return (
    <div className="relative w-96">
      {/* SEARCH INPUT */}
      <div className="relative">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />

        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            mode === "super_admin"
              ? "Search vendors..."
              : "Search campaigns, leads, team, products..."
          }
          className="w-full pl-10 pr-10 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#7E22CE]"
        />

        {query && (
          <button
            onClick={() => {
              setQuery("");
              setActiveIndex(0);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* SEARCHING STATE */}
      {isSearching && query && (
        <div className="absolute z-50 mt-1 w-full bg-white border rounded-md px-4 py-2 text-sm text-gray-500">
          Searching…
        </div>
      )}

      {/* RESULTS */}
      {!isSearching && query && (
        <div
          ref={listRef}
          className="absolute z-50 mt-1 w-full bg-white border rounded-md shadow-lg max-h-80 overflow-y-auto"
        >
          {flatResults.length === 0 ? (
            <div className="px-4 py-3 text-sm text-gray-500">
              No results found
            </div>
          ) : (
            indexedResults.map(({ group, items }) => {
              if (!items.length) return null;

              return (
                <div key={group}>
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase bg-gray-50">
                    {GROUP_LABELS[group]}
                  </div>

                  {items.map(item => {
                    const isActive =
                      item.__index === activeIndex;

                    return (
                      <div
                        ref={el => {
                          itemRefs.current[item.__index] = el;
                        }}
                        key={`${item.type}-${item.id}`}
                        onMouseEnter={() =>
                          setActiveIndex(item.__index)
                        }
                        onClick={() => handleSelect(item)}
                        className={`px-4 py-2 flex justify-between items-center cursor-pointer ${
                          isActive
                            ? "bg-blue-100"
                            : "hover:bg-gray-100"
                        }`}
                      >
                        <span>{item.label}</span>
                        <span className="text-xs uppercase text-gray-500">
                          {item.type}
                        </span>
                      </div>
                    );
                  })}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
