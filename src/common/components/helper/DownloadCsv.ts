export function downloadCSV<T extends Record<string, any>>(
  rows: T[],
  filename: string
) {
  if (!rows.length) return;

  const headers = Object.keys(rows[0]) as (keyof T)[];

  const csv = [
    headers.join(","), // header row
    ...rows.map((row) =>
      headers
        .map((h) => {
          const val = row[h];
          if (val === null || val === undefined) return "";
          return `"${String(val).replace(/"/g, '""')}"`;
        })
        .join(",")
    ),
  ].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
