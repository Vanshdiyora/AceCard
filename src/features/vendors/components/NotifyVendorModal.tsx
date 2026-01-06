import { useEffect, useState } from "react";
import { useAppDispatch } from "../../../app/hooks";
import { notifyVendor, fetchVendors } from "../slice";

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

      dispatch(fetchVendors());
      onClose();
    } catch (err: any) {
      console.error(err);
      alert(err?.message || "Failed to send notification");
    } finally {
      setLoading(false);
    }
  };

  return (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[9999] pointer-events-auto">

      <div className="bg-white w-[400px] p-6 rounded-xl space-y-4">
        <h2 className="text-lg font-semibold">
          Notify {vendor?.legal_name || "Vendor"}
        </h2>

        <input
          className="w-full border p-2 rounded"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={loading}
        />

        <textarea
          className="w-full border p-2 rounded h-32"
          placeholder="Message"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          disabled={loading}
        />

        <div className="flex justify-end gap-2">
          <button
            className="px-4 py-2 bg-gray-200 rounded"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>

          <button
            className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
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
