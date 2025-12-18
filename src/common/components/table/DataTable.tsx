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
  onRowClick?: (row: T) => void; // ⭐ added
};

export default function DataTable<T>({
  columns,
  data,
  emptyText = "No data found",
  onRowClick,
}: Props<T>) {
  return (
    <div className="bg-white rounded-xl border shadow-sm overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b bg-gray-50 text-left text-sm text-gray-600">
            {columns.map((col, idx) => (
              <th
                key={idx}
                className={`py-3 px-4 ${
                  col.align === "right"
                    ? "text-right"
                    : col.align === "center"
                    ? "text-center"
                    : ""
                }`}
                style={{ width: col.width }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {data.length === 0 && (
            <tr>
              <td
                colSpan={columns.length}
                className="text-center py-6 text-gray-500"
              >
                {emptyText}
              </td>
            </tr>
          )}

          {data.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              onClick={() => onRowClick?.(row)} // ⭐ row click
              className={`border-b last:border-0 ${
                onRowClick
                  ? "cursor-pointer hover:bg-gray-50 transition"
                  : ""
              }`}
            >
              {columns.map((col, colIndex) => (
                <td
                  key={colIndex}
                  className={`py-3 px-4 ${
                    col.align === "right"
                      ? "text-right"
                      : col.align === "center"
                      ? "text-center"
                      : ""
                  }`}
                >
                  {col.render
                    ? col.render(row)
                    : col.accessor
                    ? String(row[col.accessor] ?? "—")
                    : "—"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
