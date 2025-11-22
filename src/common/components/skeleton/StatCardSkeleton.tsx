export default function StatCardSkeleton() {
  return (
    <div className="p-6 bg-gray-100 rounded-xl animate-pulse">
      <div className="h-4 w-32 bg-gray-300 rounded mb-4"></div>
      <div className="h-6 w-20 bg-gray-300 rounded mb-2"></div>
      <div className="h-3 w-16 bg-gray-300 rounded"></div>
    </div>
  );
}
