import { useEffect, useState } from "react";
import { useAppDispatch } from "../../../app/hooks";
import { notifyVendor } from "../slice";
import type { VendorItem } from "../types";

type Props = {
  open: boolean;
  onClose: () => void;
  vendor: VendorItem | null;
  onSuccess?: () => void;
  onError?: (message: string) => void;
  setProcessing?: (v: boolean) => void;
};

function getErrorMessage(err: unknown): string {
  if (typeof err === "string") return err;
  if (err instanceof Error) return err.message;
  return "Failed to send notification";
}

export default function NotifyVendorModal({
  open,
  onClose,
  vendor,
  onSuccess,
  onError,
  setProcessing,
}: Props) {
  const dispatch = useAppDispatch();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);

  /* Reset form */
  useEffect(() => {
    if (open) {
      setTitle("");
      setBody("");
    }
  }, [open, vendor?.id]);

  /* Scroll lock */
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  const handleSend = async () => {
    if (!title.trim() || !body.trim()) {
      onError?.("Title and message are required");
      return;
    }

    if (!vendor?.id) {
      onError?.("No vendor selected");
      return;
    }

    try {
      setLoading(true);
      setProcessing?.(true);

      await dispatch(
        notifyVendor({
          vendor_ids: [vendor.id],
          title: title.trim(),
          body: body.trim(),
        })
      ).unwrap();

      onClose();
      onSuccess?.();   // ✅ THIS WAS MISSING

    } catch (err) {
      onError?.(getErrorMessage(err));   // ✅ Use parent ResultModal
    } finally {
      setLoading(false);
      setProcessing?.(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[9999]">
      <div className="bg-white w-[420px] rounded-2xl shadow-xl overflow-hidden">

        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">
            Notify {vendor?.legal_name || "Vendor"}
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Send a message or notification to this vendor
          </p>
        </div>

        <div className="px-6 py-4 space-y-4">
          <div>
            <label className="text-xs text-gray-500">Title</label>
            <input
              className="w-full border rounded-lg px-3 py-2 mt-1 outline-none"
              placeholder="Enter message title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={loading}
            />
          </div>

          <div>
            <label className="text-xs text-gray-500">Message</label>
            <textarea
              className="w-full border rounded-lg px-3 py-2 mt-1 h-28 resize-none outline-none"
              placeholder="Type your message here..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              disabled={loading}
            />
          </div>
        </div>

        <div className="px-6 py-4 border-t flex justify-end gap-3">
          <button
            className="px-4 py-2 rounded-lg border"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>

          <button
            className="px-4 py-2 rounded-lg bg-[#D8B4FE] text-black disabled:opacity-50"
            onClick={handleSend}
            disabled={loading}
          >
            {loading ? "Sending..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}