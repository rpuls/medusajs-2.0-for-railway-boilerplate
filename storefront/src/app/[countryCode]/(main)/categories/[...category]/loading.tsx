import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"

export default function Loading() {
  return (
    <div className="py-12">
      <div className="content-container">
        <SkeletonProductGrid />
      </div>
    </div>
  )
}

