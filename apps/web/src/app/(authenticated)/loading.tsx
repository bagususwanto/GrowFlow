import { Skeleton } from '@web/components/ui/skeleton';

export default function DashboardLoading() {
  return (
    <div className="space-y-8">
      {/* Upper Welcome Banner Skeleton */}
      <div className="rounded-2xl border border-border/60 bg-muted/20 p-6 backdrop-blur-xl space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Grid Cards Skeleton */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-border/60 bg-muted/20 p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-8 rounded-lg" />
            </div>
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-3 w-40" />
          </div>
        ))}
      </div>

      {/* Detailed Section Skeletons */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Chart/Table Skeleton */}
        <div className="lg:col-span-2 rounded-xl border border-border/60 bg-muted/20 p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-border/40 pb-4">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-8 w-20 rounded" />
          </div>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <Skeleton className="h-6 w-16" />
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar Mini widget Skeleton */}
        <div className="rounded-xl border border-border/60 bg-muted/20 p-6 space-y-6">
          <div className="border-b border-border/40 pb-4">
            <Skeleton className="h-6 w-32" />
          </div>
          <div className="space-y-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-12" />
                </div>
                <Skeleton className="h-2 w-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
