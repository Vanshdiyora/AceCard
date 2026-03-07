import { useEffect, useMemo, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { fetchTeam } from "../../teams/slice";
import { sendTeamNotification } from "../slice";
import BrandLoader from "../../../common/ui/BrandLoader";
import BlockingLoader from "../../../common/ui/BlockingLoader";
import ResultModal from "../../../common/ui/ResultModal";
import type { TeamMember } from "../../teams/types";
import NotificationHistoryModal from "../components/NotificationHistoryModal";
import { History } from "lucide-react";
import {
  fetchSentNotifications,
  resetSentNotifications
} from "../slice";
import JoditEditor from "jodit-react";
import "jodit/es2021/jodit.min.css";

const PAGE_SIZE = 10;

export default function NotificationTeamPage() {
  const dispatch = useAppDispatch();

  /* ✅ STATE FROM REDUX */
  const members = useAppSelector((s) => s.team.members);
  const membersMeta = useAppSelector((s) => s.team.meta.members);
  const loading = useAppSelector((s) => s.team.loading);

  /* ---------- UI STATE ---------- */
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Record<number, TeamMember>>({});
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
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historySearch, setHistorySearch] = useState("");

  const sentNotifications = useAppSelector((s) => s.notifications.sentList);
  const historyLoading = useAppSelector((s) => s.notifications.sentLoading);
  const historyMeta = useAppSelector((s) => s.notifications.sentMeta);
  const listRef = useRef<HTMLDivElement>(null);

  const isInitialLoading =
    loading && !loadingMore && !isSearching && !selectAllLoading;

  /* ======================================================
     INITIAL LOAD
  ====================================================== */

  useEffect(() => {
    if (!membersMeta || members.length === 0) {
      dispatch(fetchTeam({ page: 1, page_size: PAGE_SIZE }));
    }
  }, [dispatch, membersMeta, members.length]);

  /* ======================================================
     SEARCH (DEBOUNCED)
  ====================================================== */

  useEffect(() => {
    const t = setTimeout(() => {
      setIsSearching(true);
      dispatch(
        fetchTeam({
          page: 1,
          page_size: PAGE_SIZE,
          search,
        })
      ).finally(() => setIsSearching(false));
    }, 300);

    return () => clearTimeout(t);
  }, [search, dispatch]);

  const loadMoreHistory = () => {
    if (!historyMeta?.has_next || historyLoading) return;

    dispatch(
      fetchSentNotifications({
        page: historyMeta.page + 1,
        page_size: historyMeta.page_size,
        search: historySearch,
      })
    );
  };

  useEffect(() => {
    if (!historyOpen) return;

    dispatch(resetSentNotifications());

    dispatch(
      fetchSentNotifications({
        page: 1,
        page_size: 10,
        search: historySearch,
      })
    );
  }, [historyOpen, historySearch, dispatch]);
  /* ======================================================
     FILTERED LIST
  ====================================================== */

  const filtered = useMemo(() => {
    if (!search) return members;
    return members.filter(
      (m) =>
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.email.toLowerCase().includes(search.toLowerCase())
    );
  }, [members, search]);

  /* ======================================================
     SELECTION
  ====================================================== */

  const toggleMember = (m: TeamMember) => {
    setSelected((prev) => ({ ...prev, [m.id]: m }));
    setAllSelected(false);
    setSearch("");
  };

  const removeMember = (id: number) => {
    setSelected((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
    setAllSelected(false);
  };

  /* ======================================================
     INFINITE SCROLL
  ====================================================== */

  const handleScroll = () => {
    if (!listRef.current || loadingMore || !membersMeta) return;

    const { scrollTop, scrollHeight, clientHeight } = listRef.current;

    if (
      scrollTop + clientHeight >= scrollHeight - 20 &&
      membersMeta.page < membersMeta.total_pages
    ) {
      setLoadingMore(true);
      dispatch(
        fetchTeam({
          page: membersMeta.page + 1,
          page_size: PAGE_SIZE,
          search,
          append: true,
        })
      ).finally(() => setLoadingMore(false));
    }
  };

  /* ======================================================
     SELECT ALL
  ====================================================== */

  const selectAll = async () => {
    if (!membersMeta) return;

    if (allSelected) {
      setSelected({});
      setAllSelected(false);
      return;
    }

    setSelectAllLoading(true);

    const res = await dispatch(
      fetchTeam({
        page: 1,
        page_size: membersMeta.total_count,
        search,
      })
    ).unwrap();

    const all: Record<number, TeamMember> = {};
    res.members.forEach((m: TeamMember) => (all[m.id] = m));

    setSelected(all);
    setAllSelected(true);
    setSelectAllLoading(false);
  };

  /* ======================================================
     VALIDATION & SEND
  ====================================================== */

  const validate = (): string | null => {
    if (!Object.keys(selected).length)
      return "Please select at least one recipient.";
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
      const ids = Object.keys(selected).map(Number);

      const recipient_type =
        allSelected ? "all_team" : ids.length === 1 ? "single" : "multiple";

      await dispatch(
        sendTeamNotification({
          recipient_type,
          target_user_ids:
            recipient_type === "all_team" ? undefined : ids,
          message_title: title,
          message_body: body,
          category: "general",
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

  /* ======================================================
     EDITOR CONFIG
  ====================================================== */

  const editorConfig = {
    readonly: false,
    height: 280,
    placeholder: "Write your message...",
    toolbarAdaptive: false,
    statusbar: false,
    buttons:
      "bold,italic,underline,strikethrough,ul,ol,link,paragraph,fontsize,brush,undo,redo",
    uploader: { insertImageAsBase64URI: false },
    enableDragAndDropFileToEditor: false,
    cleanHTML: {
      fillEmptyParagraph: false,
      removeEmptyElements: true,
      removeSpans: true,
    },
    askBeforePasteHTML: false,
    askBeforePasteFromWord: false,
    events: {
      beforePaste: (event: ClipboardEvent) => {
        const items = event.clipboardData?.items;
        if (!items) return;
        for (const item of items) {
          if (item.type.startsWith("image/")) {
            event.preventDefault();
          }
        }
      },
    },
  };

  /* ======================================================
     RENDER
  ====================================================== */

  return (
    <>
      <BlockingLoader show={sending} />
      <ResultModal
        open={resultOpen}
        success={resultSuccess}
        message={resultMessage}
        onClose={() => setResultOpen(false)}
      />

      <div className="h-[calc(100dvh-var(--app-header-height))] p-6 overflow-hidden">
        <div className="mx-auto space-y-5">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-800">
              Team Notification
            </h1>

            <div className="flex gap-3">

              <button
                onClick={() => setHistoryOpen(true)}
                className="px-1 py-2 rounded-lg flex items-center"
              >
                <History size={22} />
              </button>
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
                  onBlur={(v) => setBody(v)}
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow p-5 space-y-4">
              <h2 className="font-medium text-gray-700">
                Recipients ({Object.keys(selected).length})
              </h2>

              <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                {Object.values(selected).map((m) => (
                  <span
                    key={m.id}
                    className="flex items-center gap-1 bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-sm"
                  >
                    {m.name}
                    <button
                      onClick={() => removeMember(m.id)}
                      className="hover:text-purple-900"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>

              <input
                className="w-full border rounded-lg px-3 py-2 text-sm"
                placeholder="Search team members..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              <div
                ref={listRef}
                onScroll={handleScroll}
                className="border rounded-xl h-72 overflow-y-auto divide-y"
              >
                {filtered.map((m) => {
                  const isSelected = Boolean(selected[m.id]);

                  return (
                    <div
                      key={m.id}
                      onClick={() => !isSelected && toggleMember(m)}
                      className={`px-4 py-3 text-sm ${isSelected
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "hover:bg-purple-50 cursor-pointer"
                        }`}
                    >
                      <div className="font-medium">{m.name}</div>
                      <div className="text-xs text-gray-500">{m.email}</div>
                    </div>
                  );
                })}

                {(loadingMore || isSearching) && (
                  <div className="p-3 text-center">
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
      <NotificationHistoryModal
        open={historyOpen}
        notifications={sentNotifications}
        loading={historyLoading}
        hasNext={historyMeta?.has_next}
        onLoadMore={loadMoreHistory}
        onSearch={(value) => setHistorySearch(value)}
        onClose={() => setHistoryOpen(false)}
      />
    </>
  );
}
