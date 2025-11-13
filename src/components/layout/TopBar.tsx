export default function Topbar() {
  return (
    <header className="h-16 bg-white border-b px-6 flex items-center justify-between shadow-sm">
      <h3 className="text-xl font-medium">Hi, Sarah</h3>

      <input
        className="w-96 border rounded-lg px-4 py-2 text-sm"
        placeholder="Search people, leads, campaigns..."
      />

      <div className="w-10 h-10 rounded-full bg-gray-300"></div>
    </header>
  );
}
