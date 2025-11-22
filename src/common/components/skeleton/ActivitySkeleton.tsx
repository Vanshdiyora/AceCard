export default function ActivitySkeleton() {
  return (
    <div className="space-y-4">
      {[1,2,3,4].map((_, i) => (
        <div
          key={i}
          className="h-12 bg-gray-100 rounded animate-pulse"
        ></div>
      ))}
    </div>
  );
}
