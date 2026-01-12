import React from "react";
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

function getVisiblePages(page: number, totalPages: number) {
  if (totalPages <= MAX_VISIBLE) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages: (number | "...")[] = [];

  const start = Math.max(2, page - 1);
  const end = Math.min(totalPages - 1, page + 1);

  pages.push(1);

  if (start > 2) pages.push("...");

  for (let p = start; p <= end; p++) {
    pages.push(p);
  }

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

  return (
    <div className="w-full space-y-4 overflow-x-hidden">
      {/* Header */}
      <div
        className="grid text-xs font-semibold uppercase tracking-wide text-gray-500 px-4 min-w-0"
        style={{ gridTemplateColumns: gridTemplate, columnGap: "5px" }}
      >

      {columns.map((c, i) => (
  <div
    key={i}
    className={`py-2 truncate overflow-hidden whitespace-nowrap ${
      c.align === "center"
        ? "text-center"
        : c.align === "right"
        ? "text-right"
        : "text-left"
    }`}
  >
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

      {!loading && data.length > 0 && (
        <div className="space-y-3">
          {data.map((row, rowIndex) => (
            <div
              key={rowIndex}
              onClick={() => onRowClick?.(row)}
              className="grid items-center bg-white rounded-2xl border px-4 py-3 shadow-sm cursor-pointer hover:bg-gray-50 min-w-0 overflow-hidden"
              style={{ gridTemplateColumns: gridTemplate, columnGap: "5px" }}
            >

              {columns.map((col, colIndex) => {
                const content = col.render
                  ? col.render(row)
                  : col.accessor
                    ? String(row[col.accessor] ?? "—")
                    : "—";

                return (
                  <div
                    key={colIndex}
                    className={`min-w-0 overflow-hidden ${col.align === "center"
                        ? "text-center"
                        : col.align === "right"
                          ? "text-right"
                          : "text-left"
                      }`}
                  >
                    <div className="truncate overflow-hidden whitespace-nowrap" title={typeof content === "string" ? content : undefined}>
                      {content}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}

      {onPageChange && totalPages > 1 && (
        <div className="flex justify-center gap-2 pt-2 items-center">
          <button
            disabled={page === 1}
            onClick={() => onPageChange(page - 1)}
            className="px-3 py-1 disabled:opacity-50"
          >
            Prev
          </button>

          {getVisiblePages(page, totalPages).map((p, i) =>
            p === "..." ? (
              <span key={`dots-${i}`} className="px-2 text-gray-400 select-none">
                ...
              </span>
            ) : (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                className={
                  p === page
                    ? "bg-purple-200 px-3 py-1 rounded font-medium"
                    : "px-3 py-1"
                }
              >
                {p}
              </button>
            )
          )}

          <button
            disabled={page === totalPages}
            onClick={() => onPageChange(page + 1)}
            className="px-3 py-1 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

    </div>
  );
}
