import { useState } from "react";
import { useAppDispatch } from "../../../app/hooks";
import { notifyVendor,fetchVendors } from "../slice";

export default function NotifyVendorModal({ open, onClose, vendor }: any) {
  const dispatch = useAppDispatch();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  if (!open) return null;

  const handleSend = async () => {
    await dispatch(
      notifyVendor({
        vendor_ids: [vendor.id],
        title,
        body,
      })
    );
    dispatch(fetchVendors());
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-[400px] p-6 rounded-xl space-y-4">
        <h2 className="text-lg font-semibold">Notify Vendor</h2>

        <input
          className="w-full border p-2 rounded"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          className="w-full border p-2 rounded h-32"
          placeholder="Message"
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />

        <div className="flex justify-end gap-2">
          <button className="px-4 py-2 bg-gray-200 rounded" onClick={onClose}>
            Cancel
          </button>

          <button
            className="px-4 py-2 bg-blue-600 text-white rounded"
            onClick={handleSend}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
