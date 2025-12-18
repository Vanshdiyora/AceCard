export default function SuspendMemberModal({
  open,
  member,
  onClose,
  onConfirm,
}: any) {
  if (!open || !member) return null;

  const isActive = member.status === "active";

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white p-6 rounded-xl w-[420px]">
        <h2 className="text-lg font-semibold mb-2">
          {isActive ? "Suspend Member" : "Activate Member"}
        </h2>

        <p className="text-sm text-gray-600 mb-4">
          {isActive
            ? "This will disable login and hide from active roster."
            : "This will restore access immediately."}
        </p>

        <div className="flex justify-end gap-2">
          <button onClick={onClose}>Cancel</button>
          <button
            className={isActive ? "btn-danger" : "btn-success"}
            onClick={() =>
              onConfirm(isActive ? "suspended" : "active")
            }
          >
            {isActive ? "Suspend" : "Activate"}
          </button>
        </div>
      </div>
    </div>
  );
}
