import React from "react";

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

  // Pagination
  page?: number;
  pageSize?: number;
  onPageChange?: (p: number) => void;
};

export default function DataTable<T>({
  columns,
  data,
  loading = false,
  emptyText = "No data found",
  onRowClick,
  page = 1,
  pageSize = 10,
  onPageChange,
}: Props<T>) {
  const totalPages = Math.ceil(data.length / pageSize);

  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const pageData = data.slice(start, end);

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div
        className="grid text-xs font-semibold uppercase tracking-wide text-gray-500 px-4"
        style={{ gridTemplateColumns: columns.map((c) => c.width || "1fr").join(" ") }}
      >
        {columns.map((c, i) => (
          <div
            key={i}
            className={`py-2 ${
              c.align === "right"
                ? "text-right"
                : c.align === "center"
                ? "text-center"
                : "text-left"
            }`}
          >
            {c.header}
          </div>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="bg-white rounded-xl border p-10 text-center text-gray-400">
          Loading...
        </div>
      )}

      {/* Empty */}
      {!loading && data.length === 0 && (
        <div className="bg-white rounded-xl border p-10 text-center text-gray-400">
          {emptyText}
        </div>
      )}

      {/* Rows */}
      {!loading && pageData.length > 0 && (
        <div className="space-y-3">
          {pageData.map((row, rowIndex) => (
            <div
              key={rowIndex}
              onClick={() => onRowClick?.(row)}
              className={`grid items-center bg-white rounded-2xl border px-4 py-3 shadow-sm transition ${
                onRowClick ? "cursor-pointer hover:shadow-md hover:bg-gray-50" : ""
              }`}
              style={{ gridTemplateColumns: columns.map((c) => c.width || "1fr").join(" ") }}
            >
              {columns.map((col, colIndex) => (
                <div
                  key={colIndex}
                  className={`flex items-center max-w-full overflow-hidden ${
                    col.align === "right"
                      ? "justify-end text-right"
                      : col.align === "center"
                      ? "justify-center text-center"
                      : "justify-start text-left"
                  }`}
                >
                  {col.render
                    ? col.render(row)
                    : col.accessor
                    ? String(row[col.accessor] ?? "—")
                    : "—"}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && onPageChange && (
        <div className="flex justify-center gap-2 pt-2">
          <button
            disabled={page === 1}
            onClick={() => onPageChange(page - 1)}
            className="px-3 py-1 text-sm rounded border disabled:opacity-40"
          >
            Prev
          </button>

          {Array.from({ length: totalPages }).map((_, i) => {
            const p = i + 1;
            return (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                className={`px-3 py-1 text-sm rounded border ${
                  p === page ? "bg-[#D8B4FE] text-black" : "hover:bg-gray-100"
                }`}
              >
                {p}
              </button>
            );
          })}

          <button
            disabled={page === totalPages}
            onClick={() => onPageChange(page + 1)}
            className="px-3 py-1 text-sm rounded border disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
