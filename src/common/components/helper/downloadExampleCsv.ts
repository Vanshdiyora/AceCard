export function downloadExampleCSV(filename: string) {
    const csv = `Name,Category,Price,Status,Description
PS 5 1,Books testimpoiyt,124398,active,Test
update 1,Tech,2000,active,tech
`;

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();

    URL.revokeObjectURL(url);
}
