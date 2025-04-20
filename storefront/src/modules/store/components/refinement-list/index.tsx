"use client"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { usePathname, useSearchParams } from "next/navigation"

type SortOption = "created_at" | "price_asc" | "price_desc"

const sortOptions: { value: SortOption; label: string }[] = [
  { value: "created_at", label: "Latest Arrivals" },
  { value: "price_asc", label: "Price: Low → High" },
  { value: "price_desc", label: "Price: High → Low" },
]

const categories = [
  { handle: "shirts", label: "T-Shirts" },
  { handle: "sweatshirts", label: "Sweatshirts" },
  { handle: "accessories", label: "Accessories" },
]

const collections = [
  { handle: "Springtime", label: "Spring" },
  { handle: "friends", label: "Love" },
]

const RefinementList = ({ countryCode }: { countryCode: string }) => {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const sortBy = searchParams.get("sortBy") || "created_at"

  return (
    <div className="flex small:flex-col gap-12 py-4 mb-8 small:px-0 pl-6 small:min-w-[250px] small:ml-[1.675rem]">
      {/* Sort */}
      <div className="flex flex-col gap-2">
        <span className="text-xs uppercase text-gray-500">Sort by</span>
        {sortOptions.map(({ value, label }) => (
          <LocalizedClientLink
            key={value}
            href={`/${countryCode}/store?sortBy=${value}`}
            className={`text-left text-sm hover:underline ${
              sortBy === value ? "font-semibold" : "text-gray-600"
            }`}
          >
            {label}
          </LocalizedClientLink>
        ))}
      </div>

      {/* Categories */}
      <div className="flex flex-col gap-2">
        <span className="text-xs uppercase text-gray-500">Category</span>
        {categories.map(({ handle, label }) => (
          <LocalizedClientLink
            key={handle}
            href={`/${countryCode}/categories/${handle}`}
            className={`text-left text-sm hover:underline ${
              pathname.includes(`/categories/${handle}`) ? "font-semibold" : "text-gray-600"
            }`}
          >
            {label}
          </LocalizedClientLink>
        ))}
      </div>

      {/* Collections */}
      <div className="flex flex-col gap-2">
        <span className="text-xs uppercase text-gray-500">Collection</span>
        {collections.map(({ handle, label }) => (
          <LocalizedClientLink
            key={handle}
            href={`/${countryCode}/collections/${handle}`}
            className={`text-left text-sm hover:underline ${
              pathname.includes(`/collections/${handle}`) ? "font-semibold" : "text-gray-600"
            }`}
          >
            {label}
          </LocalizedClientLink>
        ))}
      </div>
    </div>
  )
}

export default RefinementList
