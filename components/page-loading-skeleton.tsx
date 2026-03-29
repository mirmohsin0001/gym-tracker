/** Shown under `AppShell` while a segment loads — no duplicate header. */
export function AppContentLoadingSkeleton() {
  return (
    <div className="container mx-auto px-4 py-6 sm:py-10 space-y-6">
      <div className="space-y-3 max-w-xl">
        <div className="h-4 w-24 rounded bg-muted/80 animate-pulse" />
        <div className="h-10 w-full sm:w-96 rounded-lg bg-muted animate-pulse" />
        <div className="h-4 w-full max-w-md rounded bg-muted/70 animate-pulse" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 rounded-2xl bg-muted animate-pulse" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-64 sm:h-80 rounded-2xl bg-muted animate-pulse" />
        <div className="h-72 rounded-2xl bg-muted animate-pulse" />
      </div>
    </div>
  )
}

/**
 * Full-page placeholder for routes without the shared app shell (e.g. login).
 */
export function PageLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-muted animate-pulse" />
            <div className="h-6 w-28 rounded-md bg-muted animate-pulse hidden sm:block" />
          </div>
          <div className="flex gap-2">
            <div className="h-9 w-20 sm:w-24 rounded-md bg-muted animate-pulse" />
            <div className="h-9 w-20 sm:w-24 rounded-md bg-muted animate-pulse" />
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-6 sm:py-10 space-y-6">
        <div className="space-y-3 max-w-xl">
          <div className="h-4 w-24 rounded bg-muted/80 animate-pulse" />
          <div className="h-10 w-full sm:w-96 rounded-lg bg-muted animate-pulse" />
          <div className="h-4 w-full max-w-md rounded bg-muted/70 animate-pulse" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-64 sm:h-80 rounded-2xl bg-muted animate-pulse" />
          <div className="h-72 rounded-2xl bg-muted animate-pulse" />
        </div>
      </main>
    </div>
  )
}
