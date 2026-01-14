import { useEffect, useMemo, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { fetchTeam } from "../../teams/slice";
import { sendTeamNotification } from "../slice";
import BrandLoader from "../../../common/ui/BrandLoader";
import BlockingLoader from "../../../common/ui/BlockingLoader";
import ResultModal from "../../../common/ui/ResultModal";
import type { TeamMember } from "../../teams/types";

import JoditEditor from "jodit-react";
import "jodit/es2021/jodit.min.css";

const PAGE_SIZE = 10;

export default function NotificationTeamPage() {
    const dispatch = useAppDispatch();
    const members = useAppSelector((s) => s.team.members);
    const meta = useAppSelector((s) => s.team.meta);
    const loading = useAppSelector((s) => s.team.loading);

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

    const listRef = useRef<HTMLDivElement>(null);

    const isInitialLoading =
        loading && !loadingMore && !isSearching && !selectAllLoading;

    useEffect(() => {
        if (!meta || members.length === 0) {
            dispatch(fetchTeam({ page: 1, page_size: PAGE_SIZE }));
        }
    }, [dispatch, meta, members.length]);

    useEffect(() => {
        const t = setTimeout(() => {
            setIsSearching(true);
            dispatch(fetchTeam({ page: 1, page_size: PAGE_SIZE, search })).finally(
                () => setIsSearching(false)
            );
        }, 300);
        return () => clearTimeout(t);
    }, [search, dispatch]);

    const filtered = useMemo(() => {
        if (!search) return members;
        return members.filter(
            (m) =>
                m.name.toLowerCase().includes(search.toLowerCase()) ||
                m.email.toLowerCase().includes(search.toLowerCase())
        );
    }, [members, search]);

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

    const handleScroll = () => {
        if (!listRef.current || loadingMore || !meta) return;

        const { scrollTop, scrollHeight, clientHeight } = listRef.current;
        if (
            scrollTop + clientHeight >= scrollHeight - 20 &&
            meta.page < meta.total_pages
        ) {
            setLoadingMore(true);
            dispatch(
                fetchTeam({
                    page: meta.page + 1,
                    page_size: PAGE_SIZE,
                    search,
                    append: true, // 👈 ADD THIS
                })
            ).finally(() => setLoadingMore(false));
        }
    };
    const validate = (): string | null => {
        if (!Object.keys(selected).length) return "Please select at least one recipient.";
        if (!title.trim()) return "Notification title is required.";
        if (!body || !body.replace(/<[^>]*>/g, "").trim())
            return "Notification body is required.";

        return null;
    };

    const selectAll = async () => {
        if (!meta) return;

        if (allSelected) {
            setSelected({});
            setAllSelected(false);
            return;
        }

        setSelectAllLoading(true);

        const res = await dispatch(
            fetchTeam({ page: 1, page_size: meta.total_count, search })
        ).unwrap();

        const all: Record<number, TeamMember> = {};
        res.members.forEach((m: TeamMember) => (all[m.id] = m));

        setSelected(all);
        setAllSelected(true);
        setSelectAllLoading(false);
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
                    target_user_ids: recipient_type === "all_team" ? undefined : ids,
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


    const editorConfig = {
        readonly: false,
        height: 280,
        placeholder: "Write your message...",
        toolbarAdaptive: false,
        statusbar: false,
        buttons:
            "bold,italic,underline,strikethrough,ul,ol,link,paragraph,fontsize,brush,undo,redo",

        // 👇 Prevent blob: URLs & image paste
        uploader: {
            insertImageAsBase64URI: false,
        },

        // 👇 Disable drag & drop files
        enableDragAndDropFileToEditor: false,

        // 👇 Sanitize pasted HTML
        cleanHTML: {
            fillEmptyParagraph: false,
            removeEmptyElements: true,
            removeSpans: true,
        },

        // 👇 Paste behavior
        askBeforePasteHTML: false,
        askBeforePasteFromWord: false,
        // strips styles + blob URLs

        // 👇 Prevent files/images on paste
        events: {
            beforePaste: (event: ClipboardEvent) => {
                const items = event.clipboardData?.items;
                if (!items) return;

                for (const item of items) {
                    if (item.type.startsWith("image/")) {
                        event.preventDefault(); // block image paste
                    }
                }
            },
        },
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
                            Team Notification
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
