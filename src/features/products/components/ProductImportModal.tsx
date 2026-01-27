import { useRef, useState } from "react";
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFilePick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] ?? null;
    setFile(selected);
  };

  const clearFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = () => {
    if (!file) return;
    onImport(file);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} width="420px">
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Import Products</h2>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Upload box */}
        <div className="border border-dashed rounded-lg p-4 text-center space-y-2">
          {!file ? (
            <>
              <p className="text-sm text-gray-500">
                Upload a CSV file to import products
              </p>
              <button
                type="button"
                onClick={handleFilePick}
                className="px-4 py-2 text-sm rounded-lg bg-purple-600 text-white hover:bg-purple-700"
              >
                Choose CSV File
              </button>
            </>
          ) : (
            <>
              <p className="text-sm text-gray-700 truncate">
                📄 {file.name}
              </p>
              <div className="flex justify-center gap-2">
                <button
                  type="button"
                  onClick={handleFilePick}
                  className="text-sm text-purple-600 hover:underline"
                >
                  Change file
                </button>
                <button
                  type="button"
                  onClick={clearFile}
                  className="text-sm text-red-500 hover:underline"
                >
                  Remove
                </button>
              </div>
            </>
          )}
        </div>

        <button
          onClick={() =>
            downloadExampleCSV("products_import_template.csv")
          }
          className="text-sm text-purple-600 hover:underline"
        >
          Download example CSV
        </button>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-3">
          <button
            onClick={onClose}
            className="border px-4 py-2 rounded-lg text-sm"
          >
            Cancel
          </button>

          <button
            disabled={!file}
            onClick={handleSubmit}
            className={`px-4 py-2 rounded-lg text-sm text-white ${
              file
                ? "bg-purple-600 hover:bg-purple-700"
                : "bg-gray-300 cursor-not-allowed"
            }`}
          >
            Import
          </button>
        </div>
      </div>
    </Modal>
  );
}
