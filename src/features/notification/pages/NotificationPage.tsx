import { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { fetchVendors } from "../../vendors/slice";
import { sendVendorNotification } from "../slice";
import BrandLoader from "../../../common/ui/BrandLoader";

const PAGE_SIZE = 10;
const MAX_VISIBLE = 4;

export default function NotificationsPage() {
  const dispatch = useAppDispatch();

  const vendors = useAppSelector((s) => s.vendors.vendors);
  const loading = useAppSelector((s) => s.vendors.loading);
  const meta = useAppSelector((s) => s.vendors.meta);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<number[]>([]);
  const [step, setStep] = useState<"select" | "compose">("select");

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  useEffect(() => {
    dispatch(fetchVendors({ page, page_size: PAGE_SIZE }));
  }, [dispatch, page]);

  const filtered = useMemo(() => {
    return vendors.filter(
      (v) =>
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

  const totalPages = meta?.total_pages ?? 1;

  const getVisiblePages = (page: number, totalPages: number) => {
    if (totalPages <= MAX_VISIBLE) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | "...")[] = [];

    const start = Math.max(2, page - 1);
    const end = Math.min(totalPages - 1, page + 1);

    pages.push(1);

    if (start > 2) pages.push("...");

    for (let p = start; p <= end; p++) {
      pages.push(p);
    }

    if (end < totalPages - 1) pages.push("...");

    pages.push(totalPages);

    return pages;
  };

  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto">
        <h1 className="text-3xl font-semibold text-gray-800 mb-8">
          Notifications
        </h1>

        {step === "select" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-medium text-gray-700">
                  Select Vendors
                </h2>
                <p className="text-sm text-gray-500">{selected.length} selected</p>
              </div>

              <input
                className="bg-white border rounded-lg px-3 py-2 text-sm w-64 focus:ring-2 focus:ring-purple-500"
                placeholder="Search vendors..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="">

              {loading ? (
                <div className="flex items-center justify-center min-h-screen">
                  <BrandLoader />
                </div>
              ) : (
                <div className="space-y-3">

                  {/* Header row */}
                  <div className="grid grid-cols-[40px_2fr_2fr] gap-4 px-4 py-2 text-xs font-medium text-gray-500 uppercase">
                    <div>
                      <input
                        type="checkbox"
                        checked={allSelected}
                        ref={(el) => {
                          if (el) el.indeterminate = someSelected;
                        }}
                        onChange={toggleSelectAll}
                        className="accent-purple-600"
                      />
                    </div>
                    <div>Vendor Name</div>
                    <div>Email</div>
                  </div>

                  {/* Rows */}
                  {filtered.map((v) => {
                    const checked = selected.includes(v.id);

                    return (
                      <div
                        key={v.id}
                        onClick={() => toggleVendor(v.id)}
                        className={`grid grid-cols-[40px_2fr_2fr] gap-4 items-center px-4 py-4 rounded-2xl bg-white shadow-sm border transition cursor-pointer ${checked
                            ? "ring-2 ring-purple-300 bg-purple-50"
                            : "hover:shadow-md"
                          }`}
                      >
                        <div>
                          <input
                            type="checkbox"
                            checked={checked}
                            readOnly
                            className="accent-purple-600"
                          />
                        </div>

                        <div className="font-medium text-gray-800">{v.legal_name}</div>
                        <div className="text-gray-500">{v.primary_email}</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>



            {totalPages > 1 && (
              <div className="flex justify-center gap-2 pt-4 items-center">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  className="px-3 py-1 border rounded disabled:opacity-40"
                >
                  Prev
                </button>

                {getVisiblePages(page, totalPages).map((p, i) =>
                  p === "..." ? (
                    <span
                      key={`dots-${i}`}
                      className="px-2 text-gray-400 select-none"
                    >
                      ...
                    </span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={
                        p === page
                          ? "bg-purple-200 px-3 py-1 rounded"
                          : "px-3 py-1 border rounded"
                      }
                    >
                      {p}
                    </button>
                  )
                )}

                <button
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                  className="px-3 py-1 border rounded disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setStep("compose")}
                disabled={!selected.length}
                className="bg-purple-600 text-white px-5 py-2 rounded-lg disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {step === "compose" && (
          <div className="bg-white border rounded-xl p-6 space-y-4">
            <h2 className="text-lg font-medium text-gray-700">
              Compose Message ({selected.length})
            </h2>

            <input
              className="border rounded-lg px-4 py-2 w-full"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <textarea
              className="border rounded-lg px-4 py-2 w-full h-40 resize-none"
              placeholder="Message..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setStep("select")}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>
              <button
                onClick={send}
                disabled={!title || !body}
                className="bg-purple-600 text-white px-5 py-2 rounded disabled:opacity-40"
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
