import Skeleton from "../../ui/Skeleton";

export default function StatsGridSkeleton() {
  return (
    <div className="grid grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="bg-white border rounded-xl p-5 space-y-3"
        >
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-8 w-20" />
        </div>
      ))}
    </div>
  );
}
