export default function ArchiveCampaignModal({
  open,
  campaignName,
  loading,
  onClose,
  onConfirm,
}: {
  open: boolean;
  campaignName: string;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-[420px] rounded-2xl shadow-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-lg font-semibold">Archive Campaign</h2>
        </div>

        <p className="text-gray-600 text-sm mb-6">
          Are you sure you want to archive{" "}
          <span className="font-medium text-gray-900">{campaignName}</span>?  
            
        </p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? "Archiving..." : "Archive"}
          </button>
        </div>
      </div>
    </div>
  );
}
