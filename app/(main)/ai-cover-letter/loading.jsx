export default function Loading() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-5">
        <div className="h-12 w-72 rounded-lg bg-muted animate-pulse" />
        <div className="h-10 w-32 rounded-md bg-muted animate-pulse" />
      </div>
      {[0, 1, 2].map((i) => (
        <div key={i} className="rounded-xl border p-6 space-y-3">
          <div className="h-6 w-2/3 rounded bg-muted animate-pulse" />
          <div className="h-4 w-40 rounded bg-muted animate-pulse" />
          <div className="h-4 w-full rounded bg-muted animate-pulse" />
          <div className="h-4 w-5/6 rounded bg-muted animate-pulse" />
        </div>
      ))}
    </div>
  );
}
