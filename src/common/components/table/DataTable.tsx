import React, { useEffect, useState, forwardRef, useImperativeHandle } from "react";
import BrandLoader from "../../ui/BrandLoader";

export type Column<T> = {
  header: string;
  accessor?: keyof T;
  width?: string;
  align?: "left" | "center" | "right";
  render?: (row: T) => React.ReactNode;
};

export type DataTableRef = {
  exportCSV: () => void;
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
  for (let p = start; p <= end; p++) pages.push(p);
  if (end < totalPages - 1) pages.push("...");
  pages.push(totalPages);

  return pages;
}

function DataTableInner<T>(
  {
    columns,
    data,
    loading = false,
    emptyText = "No data found",
    onRowClick,
    page = 1,
    totalPages = 1,
    onPageChange,
  }: Props<T>,
  ref: React.Ref<DataTableRef>
) {
  const gridTemplate = columns.map((c) => c.width || "1fr").join(" ");
  const [localPage, setLocalPage] = useState(page);

  useEffect(() => setLocalPage(page), [page]);

  useImperativeHandle(ref, () => ({
    exportCSV() {
      if (!data.length) return;

      const headers = columns.map((c) => `"${c.header}"`).join(",");

      const rows = data.map((row) =>
        columns
          .map((c) => {
            let value = "";

            if (c.accessor) value = String((row as any)[c.accessor] ?? "");
            else if (c.render) value = String(c.render(row) ?? "");

            return `"${value.replace(/"/g, '""')}"`;
          })
          .join(",")
      );

      const csv = [headers, ...rows].join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "export.csv";
      a.click();
      URL.revokeObjectURL(url);
    },
  }));

  return (
    <div className="w-full space-y-4 overflow-x-hidden">
      {/* Header */}
      <div
        className="grid text-xs font-semibold uppercase tracking-wide text-gray-500 px-4"
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
            className="grid bg-white border rounded-2xl px-4 py-3 cursor-pointer hover:bg-gray-50"
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
        <div className="flex justify-center gap-2">
          <button disabled={localPage === 1} onClick={() => onPageChange(localPage - 1)}>Prev</button>
          {getVisiblePages(localPage, totalPages).map((p, i) =>
            p === "..." ? <span key={i}>...</span> : (
              <button key={p} onClick={() => onPageChange(p)}>{p}</button>
            )
          )}
          <button disabled={localPage === totalPages} onClick={() => onPageChange(localPage + 1)}>Next</button>
        </div>
      )}
    </div>
  );
}

const DataTable = forwardRef(DataTableInner) as <T>(
  props: Props<T> & { ref?: React.Ref<DataTableRef> }
) => React.ReactElement;

export default DataTable;
