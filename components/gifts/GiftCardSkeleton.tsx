export function GiftCardSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-2xl bg-white">
      <div className="aspect-square bg-cream-dark" />
      <div className="space-y-3 p-5">
        <div className="h-4 w-3/4 rounded bg-cream-dark" />
        <div className="h-3 w-1/2 rounded bg-cream-dark" />
        <div className="h-6 w-1/3 rounded bg-cream-dark" />
      </div>
    </div>
  )
}
