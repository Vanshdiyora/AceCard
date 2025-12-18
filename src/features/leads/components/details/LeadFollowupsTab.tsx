import { Plus } from "lucide-react";

export default function LeadFollowupsTab() {
  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold">Follow-ups</h3>
        <button className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm flex items-center gap-2">
          <Plus size={14} /> Schedule Follow-up
        </button>
      </div>

      <div className="bg-white border rounded-xl p-4">
        <p className="font-medium text-sm">Friday, 20 Sep</p>
        <p className="text-sm text-gray-500">Follow up on proposal discussion</p>
        <p className="text-xs text-gray-400 mt-1">Scheduled</p>
      </div>

      <div className="bg-white border rounded-xl p-4">
        <p className="font-medium text-sm">Monday, 16 Sep</p>
        <p className="text-sm text-gray-500">Initial discovery follow-up</p>
        <p className="text-xs text-gray-400 mt-1">Completed</p>
      </div>
    </div>
  );
}
