import { CheckCircle, XCircle } from "lucide-react";

export default function ResultModal({
  open,
  success,
  message,
  onClose,
}: {
  open: boolean;
  success: boolean;
  message: string;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[110]">
      <div className="bg-white rounded-xl shadow-lg p-6 w-[360px] text-center">
        {success ? (
          <CheckCircle className="mx-auto text-green-600 mb-3" size={40} />
        ) : (
          <XCircle className="mx-auto text-red-600 mb-3" size={40} />
        )}

        <h2 className="text-lg font-semibold mb-2">
          {success ? "Success" : "Failed"}
        </h2>
        <p className="text-gray-600 text-sm mb-5">{message}</p>

        <button
          onClick={onClose}
          className="px-4 py-2 rounded bg-purple-600 text-white text-sm hover:bg-purple-700"
        >
          OK
        </button>
      </div>
    </div>
  );
}
