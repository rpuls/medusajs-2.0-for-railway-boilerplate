import SkeletonOrderCardList from "@modules/skeletons/templates/skeleton-order-card-list"

export default function Loading() {
  return (
    <div className="w-full" aria-hidden>
      <div className="mb-8 border-l-4 border-[var(--brand-secondary)] pl-4">
        <div className="h-3 w-28 rounded bg-gray-200" />
        <div className="mt-2 h-7 w-32 rounded bg-gray-200" />
        <div className="mt-3 h-4 w-72 max-w-full rounded bg-gray-200" />
      </div>
      <SkeletonOrderCardList count={3} />
    </div>
  )
}
