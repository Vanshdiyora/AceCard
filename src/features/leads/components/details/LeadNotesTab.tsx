import { Plus } from "lucide-react";
interface Props {
  leadId: number;
}

export default function LeadNotesTab({ leadId }: Props) {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold">Notes</h3>
        <button className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm flex items-center gap-2">
          <Plus size={14} /> Add Note
        </button>
      </div>

      <div className="bg-white border rounded-xl divide-y">
        <Note
          author="John Smith"
          time="2 hours ago"
          text="Had a great discovery call. Very interested in Enterprise Suite. Budget approved for Q1."
        />
        <Note
          author="Sarah Miller"
          time="1 day ago"
          text="Sent proposal and pricing deck. Follow up scheduled for Friday."
        />
        <Note
          author="John Smith"
          time="3 days ago"
          text="Initial contact made via industry conference. Very engaged."
        />
      </div>
    </div>
  );
}

const Note = ({ author, time, text }: any) => (
  <div className="px-5 py-4">
    <div className="flex justify-between text-sm">
      <p className="font-medium">{author}</p>
      <p className="text-xs text-gray-400">{time}</p>
    </div>
    <p className="text-sm text-gray-600 mt-1">{text}</p>
  </div>
);
