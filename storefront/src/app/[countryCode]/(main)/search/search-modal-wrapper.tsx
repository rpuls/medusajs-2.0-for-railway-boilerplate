'use client'

import dynamic from 'next/dynamic'

// Client Component wrapper for search modal (ssr: false)
const SearchModal = dynamic(
  () => import('@modules/search/templates/search-modal'),
  {
    ssr: false,
    loading: () => (
      <div className="fixed inset-0 bg-opacity-75 backdrop-blur-md opacity-100 h-screen w-screen flex items-center justify-center">
        <div className="text-white">Loading search...</div>
      </div>
    ),
  }
)

export default function SearchModalWrapper() {
  return <SearchModal />
}

