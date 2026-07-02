export default function Loading() {
  return (
    <div className="container mx-auto py-6 space-y-4">
      <div className="h-6 w-40 rounded bg-muted animate-pulse" />
      <div className="h-12 w-3/4 rounded-lg bg-muted animate-pulse" />
      <div className="flex flex-wrap gap-2 justify-end">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="h-9 w-24 rounded-md bg-muted animate-pulse" />
        ))}
      </div>
      <div className="h-[640px] w-full rounded-lg border bg-muted/50 animate-pulse" />
    </div>
  );
}
