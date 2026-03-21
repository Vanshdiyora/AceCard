import { createPortal } from "react-dom";
import { useEffect, useRef, useState } from "react";
import { Input, Switch } from "../../../../teams/components/details/publicProfile/TeamMemberPublicProfileTab";
import { fetchSalesProducts } from "../../../../products/slice";
import { useAppDispatch } from "../../../../../app/hooks";
import type { Product } from "../../../../products/types";
import { GripVertical, X } from "lucide-react";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";
import BrandLoader from "../../../../../common/ui/BrandLoader";

/* ================================================= */

export function ProductsEditModal({
  open,
  onClose,
  value,
  onChange,
  onSave,
}: any) {
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
  const items = Array.isArray(value?.items) ? value.items : [];
  const isSelected = (id: number) =>
    items.some((i: any) => i.id === id);

  /* ---------- SENSORS (UNCHANGED) ---------- */
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
  );

  /* ---------- SEARCH ---------- */
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

    setResults(reset ? data : (prev) => [...prev, ...data]);
    setHasNext(Boolean(meta?.has_next));
    setPage(pg);
    setLoading(false);
  };

  if (!open) return null;

  /* ---------- INFINITE SCROLL ---------- */
  const onScroll = () => {
    if (!dropdownRef.current || loading || !hasNext) return;
    const { scrollTop, scrollHeight, clientHeight } = dropdownRef.current;
    if (scrollTop + clientHeight >= scrollHeight - 20) {
      runSearch(search, page + 1);
    }
  };

  /* ---------- ADD PRODUCT ---------- */
  const addProduct = (p: Product) => {
    if (isSelected(p.id)) return;

    update({
      ...value,
      items: [
        ...items,
        {
          id: p.id,
          name: p.name,
          price: p.price,
          image_url: p.product_img_url,
          rank: items.length + 1,
          enabled: true,
        },
      ],
    });

    setShowDropdown(false);
    setSearch("");
  };

  return createPortal(
    <div
      className="
    fixed inset-0 z-[9999]
    bg-black/60 backdrop-blur-sm
    flex items-center justify-center
    px-4
    animate-slide-from-bottom
  "
      onClick={onClose}
    >

      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-white rounded-2xl shadow-xl 
                   max-h-[85vh] overflow-y-auto p-4 space-y-4"
      >
        {/* HEADER */}
        <div className="relative flex items-center justify-center">
          <h3 className="text-lg font-semibold">Edit Products</h3>

          <button
            onClick={onClose}
            className="absolute right-0 top-1/2 -translate-y-1/2
                       h-8 w-8 rounded-full flex items-center justify-center
                       text-gray-500 hover:bg-gray-100"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-medium text-gray-600">
            Section Title
          </label>

          <Input
            placeholder="Enter a section title"
            value={value?.section_title ?? ""}
            onChange={(v: string) =>
              update({ ...value, section_title: v })
            }
          />
        </div>

        <Switch
          label="Show Prices"
          value={Boolean(value?.toggle_price)}
          onChange={(v: boolean) =>
            update({ ...value, toggle_price: v })
          }
        />

        {/* ---------- SEARCH ---------- */}
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
              className="absolute z-50 w-full bg-white border rounded-lg mt-1 
                         max-h-48 overflow-y-auto shadow"
            >
              {results.map((p) => {
                const selected = isSelected(p.id);

                return (
                  <div
                    key={p.id}
                    onClick={() => !selected && addProduct(p)}
                    className={`px-3 py-2 text-sm cursor-pointer flex justify-between items-center
                      ${selected
                        ? "bg-indigo-50 text-gray-400"
                        : "hover:bg-indigo-50"
                      }`}
                  >
                    <span>{p.name}</span>
                    {selected ? (
                      <span className="text-xs">Added</span>
                    ) : (
                      <span className="text-indigo-600 font-semibold">
                        Add
                      </span>
                    )}
                  </div>
                );
              })}

              {loading && (
                <p className="text-xs text-gray-400 text-center py-2">
                  <BrandLoader />
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

        {/* ---------- CURRENT (DRAGGABLE) ---------- */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={(e) => {
            const { active, over } = e;
            if (!over || active.id === over.id) return;

            const oldIndex = items.findIndex(
              (i: any) => i.id === active.id
            );
            const newIndex = items.findIndex(
              (i: any) => i.id === over.id
            );

            const reordered = arrayMove(
              items,
              oldIndex,
              newIndex
            ).map((i: any, idx: number) => ({
              ...i,
              rank: idx + 1,
            }));

            update({ ...value, items: reordered });
          }}
        >
          <SortableContext
            items={items.map((i: any) => i.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="pt-2 space-y-2 border-t max-h-48 overflow-y-auto overscroll-contain touch-pan-y">
              {items.map((p: any) => (
                <ProductRow
                  key={p.id}
                  p={p}
                  value={value}
                  update={update}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {/* FOOTER */}
        <div className="flex gap-3 pt-4">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-lg border"
          >
            Cancel
          </button>

          <button
            onClick={onSave}
            className="flex-1 py-2 rounded-lg bg-purple-600 text-white"
          >
            Save
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

/* ================= ROW ================= */
function ProductRow({ p, value, update }: any) {
  const items = Array.isArray(value?.items) ? value.items : [];
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: p.id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={`flex items-center gap-2 bg-gray-50 p-2 rounded-lg border
        ${isDragging ? "opacity-50 scale-[1.02] z-50" : ""}
      `}
    >
      {/* drag handle (UNCHANGED) */}
      <span
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing select-none
                   touch-none text-gray-500 px-2"
      >
        <GripVertical size={18} />
      </span>

      <p className="flex-1 border rounded p-2 text-sm bg-white">
        {p.name}
      </p>

      <button
        onClick={() =>
          update({
            ...value,
            items: items
              .filter((i: any) => i.id !== p.id)
              .map((i: any, idx: number) => ({
                ...i,
                rank: idx + 1,
              })),
          })
        }
        className="text-red-500"
      >
        ✕
      </button>
    </div>
  );
}
