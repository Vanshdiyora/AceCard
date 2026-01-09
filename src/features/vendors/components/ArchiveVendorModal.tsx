import { useEffect } from "react";
import type { VendorItem } from "../types";

interface Props {
  open: boolean;
  vendor: VendorItem | null;
  onClose: () => void;
  onConfirm: () => void;
}

export default function ArchiveVendorModal({
  open,
  vendor,
  onClose,
  onConfirm,
}: Props) {
  // 🔒 Lock background scroll
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open || !vendor) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-[400px] rounded-2xl shadow-xl overflow-hidden">

        {/* Header */}
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">
            Archive Vendor
          </h2>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <p className="text-sm text-gray-600 leading-relaxed">
            Are you sure you want to archive{" "}
            <span className="font-semibold text-gray-900">
              {vendor.legal_name}
            </span>
            ?
          </p>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t flex justify-end gap-3">
          <button
            className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            onClick={onConfirm}
          >
            Archive Vendor
          </button>
        </div>

      </div>
    </div>
  );
}
