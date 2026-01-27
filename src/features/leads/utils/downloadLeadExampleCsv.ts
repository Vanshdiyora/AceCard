import { generateLeadCsvHeaders } from "./generateLeadCsvHeaders";

export function downloadLeadExampleCsv(config: any) {
  const headers = generateLeadCsvHeaders(config);
  const csv = headers.join(",") + "\n";

  const blob = new Blob([csv], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "leads_import_template.csv";
  link.click();

  URL.revokeObjectURL(url);
}
