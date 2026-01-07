export default function TableLoader({ rows = 6 }: { rows?: number }) {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="grid grid-cols-6 gap-4 items-center bg-white border rounded-2xl px-4 py-3"
        >
          <div className="h-4 bg-gray-200 rounded col-span-2" />
          <div className="h-4 bg-gray-200 rounded" />
          <div className="h-4 bg-gray-200 rounded" />
          <div className="h-4 bg-gray-200 rounded" />
          <div className="h-4 bg-gray-200 rounded" />
        </div>
      ))}
    </div>
  );
}
