export type ParsedCSVRow = Record<string, string>;

export function parseCSV(file: File): Promise<ParsedCSVRow[]> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
            const text = reader.result as string;
            const lines = text.split(/\r?\n/).filter(Boolean);

            if (lines.length < 2) {
                reject("CSV is empty");
                return;
            }

            const headers = lines[0].split(",").map(h => h.trim());

            const rows = lines.slice(1).map(line => {
                const values = line.split(",");
                const row: ParsedCSVRow = {};

                headers.forEach((header, i) => {
                    row[header] = values[i]?.trim() ?? "";
                });

                return row;
            });

            resolve(rows);
        };

        reader.onerror = () => reject("Failed to read CSV");
        reader.readAsText(file);
    });
}
