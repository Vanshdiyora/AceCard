import { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { fetchVendors } from "../../vendors/slice";
import { sendVendorNotification } from "../slice";

export default function NotificationsPage() {
  const dispatch = useAppDispatch();
  const vendors = useAppSelector((s) => s.vendors.vendors);
  const loading = useAppSelector((s) => s.vendors.loading);

  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<number[]>([]);
  const [step, setStep] = useState<"select" | "compose">("select");

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  useEffect(() => {
    dispatch(fetchVendors());
  }, [dispatch]);

  const filtered = useMemo(() => {
    return vendors.filter((v) =>
      v.legal_name.toLowerCase().includes(search.toLowerCase()) ||
      v.primary_email.toLowerCase().includes(search.toLowerCase())

    );
  }, [vendors, search]);

  const allFilteredIds = useMemo(() => filtered.map((v) => v.id), [filtered]);
  const allSelected =
    allFilteredIds.length > 0 &&
    allFilteredIds.every((id) => selected.includes(id));
  const someSelected =
    allFilteredIds.some((id) => selected.includes(id)) && !allSelected;

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelected((prev) => prev.filter((id) => !allFilteredIds.includes(id)));
    } else {
      setSelected((prev) => Array.from(new Set([...prev, ...allFilteredIds])));
    }
  };

  const toggleVendor = (id: number) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const send = () => {
    dispatch(
      sendVendorNotification({
        vendor_ids: selected,
        title,
        body,
        in_app: true,
        email: false,
      })
    );
    setSelected([]);
    setTitle("");
    setBody("");
    setStep("select");
  };

  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto">
        <h1 className="text-3xl font-semibold text-gray-800 mb-8">
          Notifications
        </h1>

        {/* STEP 1 — SELECT */}
        {step === "select" && (
          <div className="bg-transparent">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-medium text-gray-700">
                  Select Vendors
                </h2>
                <p className="text-sm text-gray-500">
                  {selected.length} selected
                </p>
              </div>

              <input
                className="bg-white/70 border border-gray-200 rounded-lg px-3 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Search vendors..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="bg-white/70 backdrop-blur border border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 text-gray-600">
                  <tr>
                    <th className="p-3 w-10">
                      <input
                        type="checkbox"
                        checked={allSelected}
                        ref={(el) => {
                          if (el) el.indeterminate = someSelected;
                        }}
                        onChange={toggleSelectAll}
                      />
                    </th>
                    <th className="p-3 text-left">Vendor</th>
                    <th className="p-3 text-left">Email</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((v) => (
                    <tr
                      key={v.id}
                      onClick={() => toggleVendor(v.id)}
                      className={`cursor-pointer transition ${
                        selected.includes(v.id)
                          ? "bg-purple-100/60"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <td className="p-3">
                        <input
                          type="checkbox"
                          checked={selected.includes(v.id)}
                          readOnly
                        />
                      </td>
                      <td className="p-3 font-medium text-gray-700">
                        {v.legal_name}
                      </td>
                      <td className="p-3 text-gray-500">
                        {v.primary_email}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {loading && (
                <div className="p-6 text-center text-gray-500">
                  Loading vendors...
                </div>
              )}
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setStep("compose")}
                disabled={!selected.length}
                className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-lg disabled:opacity-40 transition"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* STEP 2 — COMPOSE */}
        {step === "compose" && (
          <div className="bg-white/70 backdrop-blur border border-gray-200 rounded-xl p-6 space-y-4">
            <h2 className="text-lg font-medium text-gray-700">
              Compose Message ({selected.length} vendors)
            </h2>

            <input
              className="bg-white border border-gray-200 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Notification title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <textarea
              className="bg-white border border-gray-200 rounded-lg px-4 py-2 w-full h-40 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Write your message..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setStep("select")}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={send}
                disabled={!title || !body}
                className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-lg disabled:opacity-40 transition"
              >
                Send
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
