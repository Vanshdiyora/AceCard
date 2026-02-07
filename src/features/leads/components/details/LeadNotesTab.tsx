import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../../../app/hooks";
import { fetchLeadNotes } from "../../slice";
import BrandLoader from "../../../../common/ui/BrandLoader";

interface Props {
  leadId: number;
}

export default function LeadNotesTab({ leadId }: Props) {
  const dispatch = useAppDispatch();

  const notes = useAppSelector((s) => s.leads.notes[leadId]) || [];
  const loading = useAppSelector((s) => s.leads.loading);

  useEffect(() => {
    dispatch(fetchLeadNotes(leadId));
  }, [dispatch, leadId]);

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {loading && (
          <div className="flex items-center justify-center min-h-[350px]">
            <BrandLoader />
          </div>
        )}

        {!loading && notes.length === 0 && (
          <div className="bg-white border border-gray-100 rounded-2xl p-4 text-sm text-gray-500">
            No notes yet
          </div>
        )}

        {!loading &&
          notes.map((n) => (
            <NoteCard
              key={n.id}
              authorName={
                n.author_name ||
                n.author_email ||
                `User #${n.author_id}`
              }
              time={new Date(n.created_at).toLocaleString()}
              text={n.body}
            />
          ))}
      </div>
    </div>
  );
}

/* ======================================================
   NOTE CARD
====================================================== */

const NoteCard = ({
  authorName,
  time,
  text,
}: {
  authorName: string;
  time: string;
  text: string;
}) => (
  <div
    className="
      bg-white border border-gray-100 rounded-2xl
      px-5 py-4 shadow-sm hover:shadow-md transition
    "
  >
    <div className="flex items-center justify-between mb-1">
      <span className="text-sm font-semibold text-gray-900">
        {authorName}
      </span>
      <span className="text-xs text-gray-400">
        {time}
      </span>
    </div>

    <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
      {text}
    </p>
  </div>
);
