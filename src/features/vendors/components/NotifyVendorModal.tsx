import { useEffect, useState } from "react";
import { useAppDispatch } from "../../../app/hooks";
import { notifyVendor } from "../slice";

export default function NotifyVendorModal({ open, onClose, vendor }: any) {
  const dispatch = useAppDispatch();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);

  // Reset form when modal opens or vendor changes
  useEffect(() => {
    if (open) {
      setTitle("");
      setBody("");
    }
  }, [open, vendor?.id]);

  // 🔒 Disable background scroll when modal open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  const handleSend = async () => {
    if (!title.trim() || !body.trim()) {
      alert("Title and message are required");
      return;
    }

    if (!vendor?.id) {
      alert("No vendor selected");
      return;
    }

    try {
      setLoading(true);
      await dispatch(
        notifyVendor({
          vendor_ids: [vendor.id],
          title: title.trim(),
          body: body.trim(),
        })
      ).unwrap();

      onClose();
    } catch (err: any) {
      console.error(err);
      alert(err?.message || "Failed to send notification");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[9999]">
      <div className="bg-white w-[420px] rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">
            Notify {vendor?.legal_name || "Vendor"}
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Send a message or notification to this vendor
          </p>
        </div>

        {/* Body */}
        <div className="px-6 py-4 space-y-4">
          <div>
            <label className="text-xs text-gray-500">Title</label>
            <input
              className="w-full border rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Enter message title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={loading}
            />
          </div>

          <div>
            <label className="text-xs text-gray-500">Message</label>
            <textarea
              className="w-full border rounded-lg px-3 py-2 mt-1 h-28 resize-none focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Type your message here..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              disabled={loading}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t flex justify-end gap-3">
          <button
            className="px-4 py-2 rounded-lg border hover:bg-gray-50 transition"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>

          <button
            className="px-4 py-2 rounded-lg bg-[#D8B4FE] text-black hover:bg-purple-700 transition disabled:opacity-50"
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
