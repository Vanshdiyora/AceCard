import React, { useEffect, useState } from "react";
import BrandLoader from "../../ui/BrandLoader";
export type Column<T> = {
  header: string;
  accessor?: keyof T;
  width?: string;
  align?: "left" | "center" | "right";
  render?: (row: T) => React.ReactNode;
};

type Props<T> = {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyText?: string;
  onRowClick?: (row: T) => void;

  page?: number;
  totalPages?: number;
  onPageChange?: (p: number) => void;
};
const MAX_VISIBLE = 3;
type AvatarLike = {
  name?: string;
  product_img_url?: string;
  avatar?: string;
};

export const AvatarCell = (m: AvatarLike) => {
  const img = m.product_img_url || m.avatar || "";

  const initials =
    m.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "??";

  return (
    <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
      {img ? (
        <img
          src={img}
          alt={m.name || "item"}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
        />
      ) : (
        <span className="text-sm font-semibold text-gray-600">
          {initials}
        </span>
      )}
    </div>
  );
};


function getVisiblePages(page: number, totalPages: number) {
  if (totalPages <= MAX_VISIBLE) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages: (number | "...")[] = [];

  const start = Math.max(2, page - 1);
  const end = Math.min(totalPages - 1, page + 1);

  pages.push(1);
  if (start > 2) pages.push("...");
  for (let p = start; p <= end; p++) pages.push(p);
  if (end < totalPages - 1) pages.push("...");
  pages.push(totalPages);

  return pages;
}

export default function DataTable<T>({
  columns,
  data,
  loading = false,
  emptyText = "No data found",
  onRowClick,
  page = 1,
  totalPages = 1,
  onPageChange,
}: Props<T>) {
  const gridTemplate = columns.map((c) => c.width || "1fr").join(" ");

  const [uiPage, setUiPage] = useState(page);

  // Sync UI page when external page changes (API response)
  useEffect(() => {
    setUiPage(page);
  }, [page]);

  return (
    <div className="w-full space-y-4 overflow-x-hidden">
      {/* Header */}
      <div
        className="grid text-xs font-semibold uppercase tracking-wide text-gray-500 px-4 items-center"
        style={{ gridTemplateColumns: gridTemplate, columnGap: "5px" }}
      >
        {columns.map((c, i) => (
          <div key={i} className="py-2 truncate">
            {c.header}
          </div>
        ))}
      </div>

      {loading && (
        <div className="bg-white rounded-xl border p-10">
          <BrandLoader message="Loading data..." />
        </div>
      )}

      {!loading && data.length === 0 && (
        <div className="bg-white rounded-xl border p-10 text-center text-gray-400">
          {emptyText}
        </div>
      )}

      {!loading &&
        data.map((row, i) => (
          <div
            key={i}
            onClick={() => onRowClick?.(row)}
            className="grid bg-white border rounded-2xl px-4 py-3 cursor-pointer hover:bg-gray-50 items-center"
            style={{ gridTemplateColumns: gridTemplate, columnGap: "5px" }}
          >
            {columns.map((c, j) => (
              <div key={j} className="truncate">
                {c.render ? c.render(row) : String((row as any)[c.accessor!] ?? "—")}
              </div>
            ))}
          </div>
        ))}

      {onPageChange && totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-4">
          {/* Prev */}
          <button
            disabled={uiPage === 1}
            onClick={() => {
              const p = uiPage - 1;
              setUiPage(p);
              onPageChange(p);
            }}
            className={`w-16 px-3 py-1.5 rounded-lg text-sm font-medium border transition
        ${uiPage === 1
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-white hover:bg-gray-50 text-gray-700"
              }`}
          >
            Prev
          </button>

          {/* Page Numbers */}
          {getVisiblePages(uiPage, totalPages).map((p, i) =>
            p === "..." ? (
              <span
                key={i}
                className="w-9 text-center text-gray-400 select-none"
              >
                …
              </span>
            ) : (
              <button
                key={p}
                onClick={() => {
                  setUiPage(p);
                  onPageChange(p);
                }}
                className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium border transition
            ${p === uiPage
                    ? "bg-purple-600 text-white border-purple-600 shadow-sm"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
              >
                {p}
              </button>
            )
          )}

          {/* Next */}
          <button
            disabled={uiPage === totalPages}
            onClick={() => {
              const p = uiPage + 1;
              setUiPage(p);
              onPageChange(p);
            }}
            className={`w-16 px-3 py-1.5 rounded-lg text-sm font-medium border transition
        ${uiPage === totalPages
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-white hover:bg-gray-50 text-gray-700"
              }`}
          >
            Next
          </button>
        </div>
      )}

    </div>
  );
}
