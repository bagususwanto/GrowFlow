export default function DashboardLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Upper Welcome Banner Skeleton */}
      <div className="rounded-2xl border border-border/60 bg-muted/20 p-6 backdrop-blur-xl">
        <div className="h-8 w-64 rounded bg-muted/80"></div>
        <div className="mt-2 h-4 w-96 rounded bg-muted/40"></div>
      </div>

      {/* Grid Cards Skeleton */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-border/60 bg-muted/20 p-6 shadow-md backdrop-blur-xl"
          >
            <div className="flex items-center justify-between">
              <div className="h-4 w-24 rounded bg-muted/80"></div>
              <div className="h-8 w-8 rounded-lg bg-muted/60"></div>
            </div>
            <div className="mt-4 h-8 w-32 rounded bg-muted/80"></div>
            <div className="mt-2 h-3 w-40 rounded bg-muted/40"></div>
          </div>
        ))}
      </div>

      {/* Detailed Section Skeletons */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Chart/Table Skeleton */}
        <div className="lg:col-span-2 rounded-xl border border-border/60 bg-muted/20 p-6 backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-border/40 pb-4">
            <div className="h-6 w-48 rounded bg-muted/80"></div>
            <div className="h-8 w-20 rounded bg-muted/60"></div>
          </div>
          <div className="mt-6 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-muted/80"></div>
                  <div className="space-y-2">
                    <div className="h-4 w-40 rounded bg-muted/80"></div>
                    <div className="h-3 w-24 rounded bg-muted/40"></div>
                  </div>
                </div>
                <div className="h-6 w-16 rounded bg-muted/80"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar Mini widget Skeleton */}
        <div className="rounded-xl border border-border/60 bg-muted/20 p-6 backdrop-blur-xl">
          <div className="border-b border-border/40 pb-4">
            <div className="h-6 w-32 rounded bg-muted/80"></div>
          </div>
          <div className="mt-6 space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between">
                  <div className="h-4 w-28 rounded bg-muted/80"></div>
                  <div className="h-4 w-12 rounded bg-muted/80"></div>
                </div>
                <div className="h-2 w-full rounded bg-muted/80"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
