import { Suspense } from "react"
import SearchModalWrapper from "./search-modal-wrapper"

export default function SearchModalRoute() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchModalWrapper />
    </Suspense>
  )
}
