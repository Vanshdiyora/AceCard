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
  emptyText?: string;
  onRowClick?: (row: T) => void;
};

export default function DataTable<T>({
  columns,
  data,
  emptyText = "No data found",
  onRowClick,
}: Props<T>) {
  return (
    <div className="w-full">
      {/* Header */}
      <div
        className="grid text-xs font-semibold uppercase tracking-wide text-gray-500 px-4 mb-2"
        style={{
          gridTemplateColumns: columns.map((c) => c.width || "1fr").join(" "),
        }}
      >
        {columns.map((c, i) => (
          <div
            key={i}
            className={`py-2 ${c.align === "right"
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

      {/* Empty */}
      {data.length === 0 && (
        <div className="bg-white rounded-xl border p-10 text-center text-gray-400">
          {emptyText}
        </div>
      )}

      {/* Rows */}
      <div className="space-y-3">
        {data.map((row, rowIndex) => (
          <div
            key={rowIndex}
            onClick={() => onRowClick?.(row)}
            className={`grid items-center bg-white rounded-2xl border px-4 py-3 shadow-sm transition ${onRowClick
                ? "cursor-pointer hover:shadow-md hover:bg-gray-50"
                : ""
              }`}
            style={{
              gridTemplateColumns: columns.map((c) => c.width || "1fr").join(" "),
            }}
          >
            {columns.map((col, colIndex) => (
              <div
                key={colIndex}
                className={`flex items-center max-w-full overflow-hidden ${col.align === "right"
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
    </div>
  );
}
