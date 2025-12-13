export default function SkeletonProductCard() {
  return (
    <div className="bg-white p-5 rounded-xl shadow animate-pulse border">
      <div className="h-5 bg-gray-300 rounded w-1/2 mb-3"></div>
      <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>

      <div className="h-4 bg-gray-300 rounded w-1/3 mb-2"></div>
      <div className="h-4 bg-gray-300 rounded w-1/4"></div>
    </div>
  );
}
