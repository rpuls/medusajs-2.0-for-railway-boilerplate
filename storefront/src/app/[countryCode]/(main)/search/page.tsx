import dynamic from "next/dynamic"
import { Suspense } from "react"

// Lazy load search modal (client-side only, heavy component)
const SearchModal = dynamic(
  () => import("@modules/search/templates/search-modal"),
  {
    ssr: false,
    loading: () => (
      <div className="fixed inset-0 bg-opacity-75 backdrop-blur-md opacity-100 h-screen w-screen flex items-center justify-center">
        <div className="text-white">Loading search...</div>
      </div>
    ),
  }
)

export default function SearchModalRoute() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchModal />
    </Suspense>
  )
}
