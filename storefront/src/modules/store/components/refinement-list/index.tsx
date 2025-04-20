"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback } from "react"

import SortProducts, { SortOptions } from "./sort-products"

const categories = [
  { value: "", label: "All Categories" },
  { value: "tshirts", label: "T-Shirts" },
  { value: "sweatshirts", label: "Sweatshirts" },
  { value: "accessories", label: "Accessories" },
]

const collections = [
  { value: "", label: "All Collections" },
  { value: "spring", label: "Spring" },
  { value: "love", label: "Love" },
]

type RefinementListProps = {
  sortBy: SortOptions
  search?: boolean
  "data-testid"?: string
}

const RefinementList = ({ sortBy, "data-testid": dataTestId }: RefinementListProps) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams)
      if (value) {
        params.set(name, value)
      } else {
        params.delete(name)
      }
      return params.toString()
    },
    [searchParams]
  )

  const setQueryParams = (name: string, value: string) => {
    const query = createQueryString(name, value)
    router.push(`${pathname}?${query}`)
  }

  return (
    <div className="flex small:flex-col gap-12 py-4 mb-8 small:px-0 pl-6 small:min-w-[250px] small:ml-[1.675rem]">
      <div className="flex flex-col gap-2">
        <span className="text-xs uppercase text-gray-500">Sort by</span>
        <SortProducts
          sortBy={sortBy}
          setQueryParams={setQueryParams}
          data-testid={dataTestId}
        />
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-xs uppercase text-gray-500">Category</span>
        {categories.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setQueryParams("category", value)}
            className={`text-left text-sm hover:underline ${
              searchParams.get("category") === value ? "font-semibold" : "text-gray-600"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-xs uppercase text-gray-500">Collection</span>
        {collections.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setQueryParams("collection", value)}
            className={`text-left text-sm hover:underline ${
              searchParams.get("collection") === value ? "font-semibold" : "text-gray-600"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default RefinementList
