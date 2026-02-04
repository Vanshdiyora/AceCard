import { createPortal } from "react-dom";
import { useEffect, useRef, useState } from "react";
import { Input, Switch } from "../../../../teams/components/details/publicProfile/TeamMemberPublicProfileTab";
import { fetchSalesProducts } from "../../../../products/slice";
import { useAppDispatch } from "../../../../../app/hooks";
import type { Product } from "../../../../products/types";

export function ProductsEditModal({
  open,
  onClose,
  value,
  onChange,
}: any) {
  if (!open) return null;

  const dispatch = useAppDispatch();

  const [search, setSearch] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const update = (next: any) => onChange(next);

  const isSelected = (id: number) =>
    value.items.some((i: any) => i.id === id);

  /* ---------- CLICK OUTSIDE ---------- */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* ---------- DEBOUNCED SEARCH ---------- */
  useEffect(() => {
    if (!open) return;

    const t = setTimeout(() => {
      setPage(1);
      runSearch(search, 1, true);
    }, 400);

    return () => clearTimeout(t);
  }, [search, open]);

  const runSearch = async (q: string, pg: number, reset = false) => {
    if (loading) return;
    setLoading(true);

    const r = await dispatch(
      fetchSalesProducts({
        page: pg,
        page_size: 10,
        search: q || undefined,
        mode: "infinite",
      })
    ).unwrap();

    const data = r.data ?? [];
    const meta = r.meta;

    setResults(reset ? data : prev => [...prev, ...data]);
    setHasNext(Boolean(meta?.has_next));
    setPage(pg);
    setLoading(false);
  };

  /* ---------- INFINITE SCROLL ---------- */
  const onScroll = () => {
    if (!dropdownRef.current || loading || !hasNext) return;

    const { scrollTop, scrollHeight, clientHeight } = dropdownRef.current;
    if (scrollTop + clientHeight >= scrollHeight - 20) {
      runSearch(search, page + 1);
    }
  };

  /* ---------- ADD ---------- */
  const addProduct = (p: Product) => {
    if (isSelected(p.id)) return;

    update({
      ...value,
      items: [
        ...value.items,
        {
          id: p.id,
          name: p.name,
          price: p.price,
          image_url: p.product_img_url,
          rank: value.items.length + 1,
          enabled: true,
        },
      ],
    });

    setShowDropdown(false);
    setSearch("");
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] bg-black/60 flex justify-center items-center px-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-white rounded-2xl shadow-xl max-h-[85vh] overflow-y-auto p-4 space-y-4"
      >
        <h3 className="text-lg font-semibold">Edit Products</h3>

        <Input
          value={value.section_title}
          onChange={(v: string) =>
            update({ ...value, section_title: v })
          }
        />

        <Switch
          label="Show Prices"
          value={value.toggle_price}
          onChange={(v: boolean) =>
            update({ ...value, toggle_price: v })
          }
        />

        {/* ---------- DROPDOWN SEARCH ---------- */}
        <div ref={containerRef} className="relative">
          <input
            placeholder="Search & add products..."
            className="w-full border rounded-lg p-2 text-sm"
            value={search}
            onFocus={() => setShowDropdown(true)}
            onChange={(e) => setSearch(e.target.value)}
          />

          {showDropdown && (
            <div
              ref={dropdownRef}
              onScroll={onScroll}
              className="absolute z-50 w-full bg-white border rounded-lg mt-1 max-h-48 overflow-y-auto shadow"
            >
              {results.map((p) => {
                const selected = isSelected(p.id);

                return (
                  <div
                    key={p.id}
                    onClick={() => !selected && addProduct(p)}
                    className={`px-3 py-2 text-sm cursor-pointer flex justify-between items-center
                      ${
                        selected
                          ? "bg-indigo-50 text-gray-400"
                          : "hover:bg-indigo-50"
                      }`}
                  >
                    <span>{p.name}</span>
                    {selected ? (
                      <span className="text-xs">Added</span>
                    ) : (
                      <span className="text-indigo-600 font-semibold">Add</span>
                    )}
                  </div>
                );
              })}

              {loading && (
                <p className="text-xs text-gray-400 text-center py-2">
                  Loading...
                </p>
              )}

              {!loading && results.length === 0 && (
                <p className="text-xs text-gray-400 text-center py-2">
                  No products found
                </p>
              )}
            </div>
          )}
        </div>

        {/* ---------- CURRENT ---------- */}
        <div className="pt-2 space-y-2 border-t">
          {value.items.map((p: any, i: number) => (
            <div key={p.id} className="flex items-center gap-2">
              <span className="cursor-grab">☰</span>

              <p
                className="flex-1 border rounded p-2 text-sm"
              >{p.name}</p>

              <button
                onClick={() =>
                  update({
                    ...value,
                    items: value.items.filter(
                      (_: any, idx: number) => idx !== i
                    ),
                  })
                }
                className="text-red-500"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="w-full py-2 rounded-lg bg-indigo-600 text-white"
        >
          Done
        </button>
      </div>
    </div>,
    document.body
  );
}
