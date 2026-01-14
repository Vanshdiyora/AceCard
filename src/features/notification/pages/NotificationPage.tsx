import { useEffect, useMemo, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { fetchVendors } from "../../vendors/slice";
import { sendVendorNotification } from "../slice";
import BrandLoader from "../../../common/ui/BrandLoader";
import BlockingLoader from "../../../common/ui/BlockingLoader";
import ResultModal from "../../../common/ui/ResultModal";
import type { VendorItem } from "../../vendors/types";

import JoditEditor from "jodit-react";
import "jodit/es2021/jodit.min.css";

const PAGE_SIZE = 10;

export default function NotificationsPage() {
  const dispatch = useAppDispatch();
  const vendors = useAppSelector((s) => s.vendors.vendors);
  const meta = useAppSelector((s) => s.vendors.meta);
  const loading = useAppSelector((s) => s.vendors.loading);

  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Record<number, VendorItem>>({});
  const [loadingMore, setLoadingMore] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [selectAllLoading, setSelectAllLoading] = useState(false);
  const [allSelected, setAllSelected] = useState(false);

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const [sending, setSending] = useState(false);
  const [resultOpen, setResultOpen] = useState(false);
  const [resultSuccess, setResultSuccess] = useState(false);
  const [resultMessage, setResultMessage] = useState("");

  const listRef = useRef<HTMLDivElement>(null);

  const isInitialLoading =
    loading && !loadingMore && !isSearching && !selectAllLoading;

  const totalCount = meta?.total_count ?? null;

  useEffect(() => {
    if (!meta || vendors.length === 0) {
      dispatch(fetchVendors({ page: 1, page_size: PAGE_SIZE }));
    }
  }, [dispatch, meta, vendors.length]);

  useEffect(() => {
    const t = setTimeout(() => {
      setIsSearching(true);
      dispatch(fetchVendors({ page: 1, page_size: PAGE_SIZE, search })).finally(
        () => setIsSearching(false)
      );
    }, 300);
    return () => clearTimeout(t);
  }, [search, dispatch]);

useEffect(() => {
  const scrollContainers = [
    document.body,
    document.documentElement,
    document.getElementById("root"),
  ];

  if (resultOpen) {
    scrollContainers.forEach((el) => {
      if (el) el.style.overflow = "hidden";
    });
  } else {
    scrollContainers.forEach((el) => {
      if (el) el.style.overflow = "";
    });
  }

  return () => {
    scrollContainers.forEach((el) => {
      if (el) el.style.overflow = "";
    });
  };
}, [resultOpen]);

  const filtered = useMemo(() => {
    if (!search) return vendors;
    return vendors.filter(
      (v) =>
        v.legal_name.toLowerCase().includes(search.toLowerCase()) ||
        v.primary_email.toLowerCase().includes(search.toLowerCase())
    );
  }, [vendors, search]);

  const toggleVendor = (vendor: VendorItem) => {
    setSelected((prev) => ({ ...prev, [vendor.id]: vendor }));
    setAllSelected(false);
    setSearch("");
  };

  const removeVendor = (id: number) => {
    setSelected((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
    setAllSelected(false);
  };

  const handleScroll = () => {
    if (!listRef.current || loadingMore || !meta) return;

    const { scrollTop, scrollHeight, clientHeight } = listRef.current;

    if (
      scrollTop + clientHeight >= scrollHeight - 20 &&
      meta.page < meta.total_pages
    ) {
      const next = meta.page + 1;
      setLoadingMore(true);

      dispatch(
        fetchVendors({
          page: next,
          page_size: PAGE_SIZE,
          search,
          append: true,
        })
      ).finally(() => setLoadingMore(false));
    }
  };

  const selectAll = async () => {
    if (!meta) return;

    if (allSelected) {
      setSelected({});
      setAllSelected(false);
      return;
    }

    setSelectAllLoading(true);

    const pageSize = totalCount ?? meta.total_pages * PAGE_SIZE;

    const res = await dispatch(
      fetchVendors({ page: 1, page_size: pageSize, search })
    ).unwrap();

    const all: Record<number, VendorItem> = {};
    res.data.forEach((v) => (all[v.id] = v));

    setSelected(all);
    setAllSelected(true);
    setSelectAllLoading(false);
  };
  const validate = (): string | null => {
  if (!Object.keys(selected).length) return "Please select at least one vendor.";
  if (!title.trim()) return "Notification title is required.";
  if (!body || !body.replace(/<[^>]*>/g, "").trim())
    return "Notification body is required.";
  return null;
};


 const send = async () => {
  const error = validate();

  if (error) {
    setResultSuccess(false);
    setResultMessage(error);
    setResultOpen(true);
    return;
  }

  setSending(true);
  try {
    await dispatch(
      sendVendorNotification({
        vendor_ids: Object.keys(selected).map(Number),
        title,
        body,
        in_app: true,
        email: false,
      })
    ).unwrap();

    setResultSuccess(true);
    setResultMessage("Notification sent successfully!");
    setSelected({});
    setTitle("");
    setBody("");
    setAllSelected(false);
  } catch (err: any) {
    setResultSuccess(false);
    setResultMessage(err?.message || "Failed to send notification");
  } finally {
    setSending(false);
    setResultOpen(true);
  }
};


  const editorConfig = {
    readonly: false,
    height: 280,
    placeholder: "Write your message...",
    toolbarAdaptive: false,
    statusbar: false,
    buttons:
      "bold,italic,underline,strikethrough,ul,ol,link,paragraph,fontsize,brush,undo,redo",
  };

  return (
    <>
      <BlockingLoader show={sending} />
      <ResultModal
        open={resultOpen}
        success={resultSuccess}
        message={resultMessage}
        onClose={() => setResultOpen(false)}
      />

      <div className="min-h-screen p-6">
        <div className="mx-auto space-y-5">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-800">
              New Notification
            </h1>

            <div className="flex gap-3">
              <button
                onClick={selectAll}
                disabled={selectAllLoading}
                className="px-4 py-2 rounded-lg bg-white border shadow-sm text-sm"
              >
                {allSelected
                  ? "Unselect All"
                  : selectAllLoading
                  ? "Selecting..."
                  : "Select All"}
              </button>

              <button
                onClick={send}
                className="px-5 py-2 rounded-lg bg-purple-600 text-white shadow"
              >
                Send
              </button>
            </div>
          </div>

          <div className="grid grid-cols-[2fr_1fr] gap-5">
            <div className="bg-white rounded-2xl shadow p-5 space-y-4">
              <h2 className="font-medium text-gray-700">Message</h2>

              <input
                className="w-full border rounded-lg px-4 py-2"
                placeholder="Notification title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />

              <div className="border rounded-xl overflow-hidden">
                <JoditEditor
                  value={body}
                  config={editorConfig}
                  onBlur={(newContent) => setBody(newContent)}
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow p-5 space-y-4">
              <h2 className="font-medium text-gray-700">
                Recipients ({Object.keys(selected).length})
              </h2>

              <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                {Object.values(selected).map((v) => (
                  <span
                    key={v.id}
                    className="flex items-center gap-1 bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-sm"
                  >
                    {v.legal_name}
                    <button
                      onClick={() => removeVendor(v.id)}
                      className="hover:text-purple-900"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>

              <input
                className="w-full border rounded-lg px-3 py-2 text-sm"
                placeholder="Search vendors..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              <div
                ref={listRef}
                onScroll={handleScroll}
                className="border rounded-xl h-72 overflow-y-auto divide-y"
              >
                {filtered.map((v) => {
                  const isSelected = Boolean(selected[v.id]);

                  return (
                    <div
                      key={v.id}
                      onClick={() => !isSelected && toggleVendor(v)}
                      className={`px-4 py-3 text-sm ${
                        isSelected
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "hover:bg-purple-50 cursor-pointer"
                      }`}
                    >
                      <div className="font-medium">{v.legal_name}</div>
                      <div className="text-xs text-gray-500">
                        {v.primary_email}
                      </div>
                    </div>
                  );
                })}

                {(loadingMore || isSearching) && (
                  <div className="p-3 text-center text-sm text-gray-400">
                    <BrandLoader />
                  </div>
                )}
              </div>
            </div>
          </div>

          {isInitialLoading && (
            <div className="flex justify-center py-4">
              <BrandLoader />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
