import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"

export default function Loading() {
  return (
    <div className="content-container py-12">
      <div className="animate-pulse">
        <div className="flex flex-col small:flex-row small:items-start gap-6">
          {/* Image skeleton */}
          <div className="w-full small:w-1/2">
            <div className="bg-gray-200 aspect-[29/34] rounded-lg"></div>
          </div>
          {/* Info skeleton */}
          <div className="w-full small:w-1/2 space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-12 bg-gray-200 rounded w-full"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

