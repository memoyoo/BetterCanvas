import { Skeleton } from "@/components/ui/skeleton";

export default function AppLoading() {
  return (
    <div className="space-y-6">
      {/* Page header skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-4 w-32 rounded-xl" />
        <Skeleton className="h-8 w-72 rounded-xl" />
        <Skeleton className="h-5 w-96 rounded-xl" />
      </div>

      {/* Card grid skeleton */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass-panel space-y-4 rounded-[2rem] p-6">
          <Skeleton className="h-5 w-24 rounded-xl" />
          <Skeleton className="h-6 w-48 rounded-xl" />
          <div className="space-y-3">
            <Skeleton className="h-16 w-full rounded-2xl" />
            <Skeleton className="h-16 w-full rounded-2xl" />
            <Skeleton className="h-16 w-full rounded-2xl" />
          </div>
        </div>
        <div className="glass-panel space-y-4 rounded-[2rem] p-6">
          <Skeleton className="h-5 w-28 rounded-xl" />
          <Skeleton className="h-6 w-56 rounded-xl" />
          <div className="space-y-3">
            <Skeleton className="h-16 w-full rounded-2xl" />
            <Skeleton className="h-16 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
