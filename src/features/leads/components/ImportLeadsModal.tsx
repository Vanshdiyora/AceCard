import { useState } from "react";
import Modal from "../../../common/ui/Modal";

interface ImportLeadsModalProps {
  open: boolean;
  onClose: () => void;
  onImport: (file: File) => void;
  onDownloadTemplate: () => void;
}

export default function ImportLeadsModal({
  open,
  onClose,
  onImport,
  onDownloadTemplate,
}: ImportLeadsModalProps) {
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = () => {
    if (!file) return;
    onImport(file);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} width="420px">
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Import Leads</h2>

        <div>
          <input
            type="file"
            accept=".csv"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="w-full border rounded-lg px-3 py-2 text-sm"
          />
        </div>

        <button
          onClick={onDownloadTemplate}
          className="text-sm text-purple-600 hover:underline"
        >
          Download example CSV
        </button>

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
