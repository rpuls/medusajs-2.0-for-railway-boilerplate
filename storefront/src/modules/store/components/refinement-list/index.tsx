"use client"

import { usePathname, useSearchParams } from "next/navigation"
import { useCallback } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export type SortOptions = "price_asc" | "price_desc" | "created_at"

const sortOptions: { value: SortOptions; label: string }[] = [
  { value: "created_at", label: "Latest Arrivals" },
  { value: "price_asc", label: "Price: Low → High" },
  { value: "price_desc", label: "Price: High → Low" },
]

const categories = [
  { value: "tshirts", label: "T-Shirts" },
  { value: "sweatshirts", label: "Sweatshirts" },
  { value: "accessories", label: "Accessories" },
]

const collections = [
  { value: "spring", label: "Spring" },
  { value: "love", label: "Love" },
]

const RefinementList = () => {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const countryCode = pathname.split("/")[1] // 'de' from '/de/store'

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(name, value)
      } else {
        params.delete(name)
      }
      return params.toString()
    },
    [searchParams]
  )

  const currentSort = searchParams.get("sortBy") || "created_at"
  const currentPath = pathname

  return (
    <div className="flex small:flex-col gap-12 py-4 mb-8 small:px-0 pl-6 small:min-w-[250px] small:ml-[1.675rem]">
      <div className="flex flex-col gap-2">
        <span className="text-xs uppercase text-gray-500">Sort by</span>
        {sortOptions.map(({ value, label }) => (
          <LocalizedClientLink
            key={value}
            href={`${currentPath}?${createQueryString("sortBy", value)}`}
            className={`text-left text-sm hover:underline ${
              currentSort === value ? "font-semibold" : "text-gray-600"
            }`}
          >
            {label}
          </LocalizedClientLink>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-xs uppercase text-gray-500">Category</span>
        <LocalizedClientLink
          href={`/${countryCode}/store`}
          className={`text-left text-sm hover:underline ${
            currentPath.includes("/store") ? "font-semibold" : "text-gray-600"
          }`}
        >
          All Categories
        </LocalizedClientLink>
        {categories.map(({ value, label }) => (
          <LocalizedClientLink
            key={value}
            href={`/${countryCode}/categories/${value}`}
            className="text-left text-sm hover:underline text-gray-600"
          >
            {label}
          </LocalizedClientLink>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-xs uppercase text-gray-500">Collection</span>
        <LocalizedClientLink
          href={`/${countryCode}/store`}
          className={`text-left text-sm hover:underline ${
            currentPath.includes("/store") ? "font-semibold" : "text-gray-600"
          }`}
        >
          All Collections
        </LocalizedClientLink>
        {collections.map(({ value, label }) => (
          <LocalizedClientLink
            key={value}
            href={`/${countryCode}/collections/${value}`}
            className="text-left text-sm hover:underline text-gray-600"
          >
            {label}
          </LocalizedClientLink>
        ))}
      </div>
    </div>
  )
}

export default RefinementList
