export default function PublicLoading() {
  return (
    <div className="min-h-screen animate-pulse">
      {/* Hero skeleton */}
      <div className="min-h-[60vh] bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 flex items-center">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 w-full flex flex-col lg:flex-row gap-12 py-24">
          <div className="flex-1 flex flex-col gap-5">
            <div className="h-6 w-48 bg-white/20 rounded-full" />
            <div className="h-12 w-full bg-white/20 rounded-xl" />
            <div className="h-12 w-3/4 bg-white/20 rounded-xl" />
            <div className="flex gap-3 mt-2">
              <div className="h-12 w-36 bg-white/20 rounded-xl" />
              <div className="h-12 w-36 bg-white/20 rounded-xl" />
            </div>
          </div>
          <div className="flex-1 h-72 bg-white/10 rounded-2xl hidden lg:block" />
        </div>
      </div>

      {/* Stats bar skeleton */}
      <div className="h-20 bg-muted/40" />

      {/* News section skeleton */}
      <div className="py-16 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-8 w-40 bg-muted rounded mb-10" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-xl overflow-hidden border border-border">
                <div className="h-48 bg-muted" />
                <div className="p-5 flex flex-col gap-3">
                  <div className="h-4 w-24 bg-muted rounded" />
                  <div className="h-5 w-full bg-muted rounded" />
                  <div className="h-4 w-3/4 bg-muted rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
