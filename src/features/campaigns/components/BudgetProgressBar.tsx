export function BudgetProgressBar({
    used,
    total,
}: {
    used: number;
    total: number;
}) {
    const percentage = total > 0 ? Math.min((used / total) * 100, 100) : 0;

    return (
        <div className="flex items-center gap-4 rounded-2xl border border-blue-100 bg-gradient-to-br from-white to-blue-50 px-4 py-2 shadow-sm">
            <div className="flex flex-col leading-tight">
                <span className="text-[11px] uppercase tracking-wide text-gray-500">
                    Target used
                </span>
                <span className="text-sm font-semibold text-gray-800">
                    ₹{used.toLocaleString()}
                    <span className="text-gray-400 font-medium">
                        {" "}
                        / ₹{total.toLocaleString()}
                    </span>
                </span>
            </div>

            <div className="relative w-[160px] h-2 rounded-full bg-blue-100 overflow-hidden">
                <div
                    className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 bg-gradient-to-r from-purple-500 to-fuchsia-500`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
}
