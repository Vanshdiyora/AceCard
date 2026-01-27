import { useState } from "react";
import Modal from "../../../common/ui/Modal";
import { downloadExampleCSV } from "../../../common/components/helper/downloadExampleCsv";

interface ProductImportModalProps {
    open: boolean;
    onClose: () => void;
    onImport: (file: File) => void;
}

export default function ProductImportModal({
    open,
    onClose,
    onImport,
}: ProductImportModalProps) {
    const [file, setFile] = useState<File | null>(null);

    return (
        <Modal open={open} onClose={onClose} width="420px">
            <h2 className="text-lg font-semibold mb-4">
                Import Products
            </h2>

            <div className="space-y-1 mb-3">
                <label className="text-sm font-medium">Upload CSV</label>
                <input
                    type="file"
                    accept=".csv"
                    className="w-full border rounded-lg p-2 text-sm"
                    onChange={(e) =>
                        setFile(e.target.files ? e.target.files[0] : null)
                    }
                />
            </div>

            <button
                onClick={() => downloadExampleCSV("products_import_template.csv")}
                className="text-purple-600 text-sm underline mb-6"
            >
                Download example CSV
            </button>

            <div className="flex justify-end gap-3">
                <button
                    onClick={onClose}
                    className="border px-4 py-2 rounded-lg"
                >
                    Cancel
                </button>

                <button
                    disabled={!file}
                    onClick={() => file && onImport(file)}
                    className="bg-purple-600 disabled:bg-purple-300 text-white px-4 py-2 rounded-lg"
                >
                    Import
                </button>
            </div>
        </Modal>
    );
}
