import { useEffect, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../../../../app/hooks";
import { fetchLeadNotes } from "../../slice";

interface Props {
  leadId: number;
}

const Note = ({ authorName, time, text }: any) => (
  <div className="px-5 py-4">
    <div className="flex justify-between text-sm">
      <p className="font-medium">{authorName}</p>
      <p className="text-xs text-gray-400">{time}</p>
    </div>
    <p className="text-sm text-gray-600 mt-1">{text}</p>
  </div>
);

export default function LeadNotesTab({ leadId }: Props) {
  const dispatch = useAppDispatch();

  const notes = useAppSelector((s) => s.leads.notes[leadId]) || [];
  const loading = useAppSelector((s) => s.leads.loading);
  const teamMembers = useAppSelector((s) => s.team.members);

  useEffect(() => {
    dispatch(fetchLeadNotes(leadId));
  }, [dispatch, leadId]);

  // Create map: { [id]: name }
  const memberMap = useMemo(() => {
    const map: Record<number, string> = {};
    teamMembers.forEach((m) => {
      map[m.id] = m.name || m.email || `User #${m.id}`;
    });
    return map;
  }, [teamMembers]);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold">Notes</h3>
      </div>

      <div className="bg-white border rounded-xl divide-y">
        {loading && <p className="p-4 text-sm text-gray-400">Loading…</p>}

        {!loading && notes.length === 0 && (
          <p className="p-4 text-sm text-gray-500">No notes yet</p>
        )}

        {notes.map((n) => (
          <Note
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
