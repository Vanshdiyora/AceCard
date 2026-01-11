export default function SuspendMemberModal({
  open,
  memberName,
  mode, // "suspend" | "activate"
  loading,
  onClose,
  onConfirm,
}: {
  open: boolean;
  memberName: string;
  mode: "suspend" | "activate";
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  if (!open) return null;

  const isSuspend = mode === "suspend";

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-[420px] rounded-2xl shadow-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-lg font-semibold">
            {isSuspend ? "Suspend Member" : "Activate Member"}
          </h2>
        </div>

        <p className="text-gray-600 text-sm mb-6">
          {isSuspend ? (
            <>
              Are you sure you want to suspend{" "}
              <span className="font-medium text-gray-900">{memberName}</span>?  
              They will no longer be able to access the system.
            </>
          ) : (
            <>
              Are you sure you want to activate{" "}
              <span className="font-medium text-gray-900">{memberName}</span>?  
              They will regain access to the system.
            </>
          )}
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
            className={`px-4 py-2 text-white rounded-lg text-sm disabled:opacity-50 ${
              isSuspend
                ? "bg-red-600 hover:bg-red-700"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {loading
              ? isSuspend
                ? "Suspending..."
                : "Activating..."
              : isSuspend
              ? "Suspend"
              : "Activate"}
          </button>
        </div>
      </div>
    </div>
  );
}
