"use client"

import { useEffect } from "react"
import { useSearchBox, useHits } from "react-instantsearch-hooks-web"
import SearchResults from "./search-results"

type SearchBarContentProps = {
  query: string
  onClose: () => void
}

const SearchBarContent = ({ query, onClose }: SearchBarContentProps) => {
  const { refine } = useSearchBox()
  const { hits } = useHits()

  // Sync query to InstantSearch when it changes
  useEffect(() => {
    refine(query)
    // refine is stable and doesn't need to be in dependencies
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query])

  // Only show results if there are hits
  if (hits.length === 0) {
    return null
  }

  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-background-base border border-border-base rounded-lg shadow-xl max-h-[70vh] overflow-y-auto z-[52]">
      <SearchResults onClose={onClose} />
    </div>
  )
}

export default SearchBarContent

