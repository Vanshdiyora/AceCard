type TopbarProps = {
  username?: string;
  type: "admin" | "superadmin";
};

export default function Topbar({ username = "User", type }: TopbarProps) {
  if (type === "superadmin") {
    // SUPER ADMIN TOPBAR (Based on your screenshot)
    return (
      <header className="h-20 bg-white border-b px-6 flex items-center justify-between shadow-sm">
        {/* Search Box */}
        <input
          className="w-[420px] border rounded-lg px-4 py-2 text-sm shadow-sm"
          placeholder="Search vendors, reps, leads, campaigns..."
        />

        {/* Right Actions */}
        <div className="flex items-center gap-4">

          {/* Notification */}
          <div className="relative cursor-pointer">
            <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-xs px-1.5 py-0.5 rounded-full">
              7
            </span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6 text-gray-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
          </div>

          {/* Avatar */}
          <div className="flex items-center gap-2 cursor-pointer">
            <div className="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-medium">
              SA
            </div>
            <span className="text-gray-700 font-medium">Super Admin</span>
          </div>
        </div>
      </header>
    );
  }

  // ADMIN TOPBAR (Your previous design)
  return (
    <header className="h-16 bg-white border-b px-6 flex items-center justify-between shadow-sm">
      <h3 className="text-xl font-medium">Hi, {username}</h3>

      <input
        className="w-96 border rounded-lg px-4 py-2 text-sm"
        placeholder="Search people, leads, campaigns..."
      />

      <div className="w-10 h-10 rounded-full bg-gray-300"></div>
    </header>
  );
}
