import { useEffect, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../../../../app/hooks";
import { fetchLeadNotes } from "../../slice";
import { fetchTeam } from "../../../teams/slice";

interface Props {
  leadId: number;
}

export default function LeadNotesTab({ leadId }: Props) {
  const dispatch = useAppDispatch();

  const notes = useAppSelector((s) => s.leads.notes[leadId]) || [];
  const loading = useAppSelector((s) => s.leads.loading);
  const teamMembers = useAppSelector((s) => s.team.members);

  useEffect(() => {
    dispatch(fetchTeam());
    dispatch(fetchLeadNotes(leadId));
  }, [dispatch, leadId]);

  useEffect(() => {
  console.log("Team members:", teamMembers);
}, [teamMembers]);

useEffect(() => {
  console.log("Notes:", notes);
}, [notes]);

  const memberMap = useMemo(() => {
    const map: Record<number, string> = {};
    teamMembers.forEach((m) => {
      map[m.id] = m.name || m.email || `User #${m.id}`;
    });
    return map;
  }, [teamMembers]);

  return (
    <div className="space-y-6">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
        Notes
      </h3>

      <div className="space-y-3">
        {loading && (
          <div className="bg-white border border-gray-100 rounded-2xl p-4 text-sm text-gray-400">
            Loading notes…
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
              authorName={memberMap[n.author_id] || `User #${n.author_id}`}
              time={new Date(n.created_at).toLocaleString()}
              text={n.body}
            />
          ))}
      </div>
    </div>
  );
}


const NoteCard = ({
  authorName,
  time,
  text,
}: {
  authorName: string;
  time: string;
  text: string;
}) => (
  <div className="
    bg-white border border-gray-100 rounded-2xl
    px-5 py-4 shadow-sm hover:shadow-md transition
  ">
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
