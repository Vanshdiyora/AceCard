import type { VendorItem } from "../types";
interface Props {
  open: boolean;
  vendor: VendorItem | null;
  onClose: () => void;
  onConfirm: () => void;
}

export default function ArchiveVendorModal({ open, vendor, onClose, onConfirm }: Props) {
  if (!open || !vendor) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-[380px] rounded-xl shadow-lg p-6">
        <h2 className="text-lg font-semibold mb-3">Archive Vendor</h2>

        <p className="text-gray-600 text-sm mb-5">
          Are you sure you want to archive <strong>{vendor.legal_name}</strong>?
        </p>

        <div className="flex justify-end gap-3">
          <button className="px-4 py-2 border rounded" onClick={onClose}>
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-red-600 text-white rounded"
            onClick={onConfirm}
          >
            Archive
          </button>
        </div>
      </div>
    </div>
  );
}
