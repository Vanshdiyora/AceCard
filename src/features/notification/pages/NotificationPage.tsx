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
  const [open, setOpen] = useState(false);
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

  const wrapperRef = useRef<HTMLDivElement>(null);
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
    const close = (e: MouseEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

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
    setOpen(false);
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

  const send = async () => {
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
      <BlockingLoader show={sending}/>

      <ResultModal
        open={resultOpen}
        success={resultSuccess}
        message={resultMessage}
        onClose={() => setResultOpen(false)}
      />
    <div className="min-h-screen p-6">
      <div className="max-w-3xl mx-auto bg-white rounded-xl border shadow-sm p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-800">
            New Notification
          </h1>
          <button
            onClick={selectAll}
            disabled={selectAllLoading}
            className="text-sm px-3 py-1 border rounded disabled:opacity-40"
          >
            {allSelected
              ? "Unselect All"
              : selectAllLoading
              ? "Selecting..."
              : "Select All"}
          </button>
        </div>

        {/* TO FIELD */}
        <div ref={wrapperRef} className="relative w-full">
          <div
            className="flex flex-wrap items-center gap-2 border rounded-lg px-3 py-2 cursor-text max-h-32 overflow-y-auto"
            onClick={() => setOpen(true)}
          >
            <span className="text-gray-500 text-sm mr-1">To:</span>

            {Object.values(selected).map((v) => (
              <span
                key={v.id}
                className="flex items-center gap-1 bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-sm"
              >
                {v.legal_name}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeVendor(v.id);
                  }}
                  className="text-purple-500 hover:text-purple-700"
                >
                  ×
                </button>
              </span>
            ))}

            <input
              className="flex-1 outline-none text-sm min-w-[120px]"
              placeholder="Type vendor name or email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setOpen(true);
              }}
            />
          </div>

          {open && (
            <div
              ref={listRef}
              onScroll={handleScroll}
              className="absolute top-full left-0 z-10 w-full bg-white border rounded-lg mt-1 shadow h-60 overflow-auto"
            >
              {filtered.map((v) => {
                const isSelected = Boolean(selected[v.id]);

                return (
                  <div
                    key={v.id}
                    onClick={() => !isSelected && toggleVendor(v)}
                    className={`px-4 py-2 ${
                      isSelected
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "hover:bg-purple-50 cursor-pointer"
                    }`}
                  >
                    <div className="font-medium text-sm">{v.legal_name}</div>
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
          )}
        </div>

        <input
          className="border rounded-lg px-4 py-2 w-full"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        {/* JODIT EDITOR */}
        <div className="border rounded-lg overflow-hidden">
          <JoditEditor
            value={body}
            config={editorConfig}
            onBlur={(newContent) => setBody(newContent)}
          />
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={() => {
              setSelected({});
              setTitle("");
              setBody("");
              setAllSelected(false);
            }}
            className="px-4 py-2 border rounded"
          >
            Clear
          </button>
          <button
            onClick={send}
            disabled={!Object.keys(selected).length || !title || !body}
            className="bg-purple-600 text-white px-5 py-2 rounded disabled:opacity-40"
          >
            Send
          </button>
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
