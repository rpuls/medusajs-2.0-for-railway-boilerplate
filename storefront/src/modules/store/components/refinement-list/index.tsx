"use client"

import { usePathname, useSearchParams } from "next/navigation"
import { useMemo } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export type SortOptions = "price_asc" | "price_desc" | "created_at"

const sortOptions: { value: SortOptions; label: string }[] = [
  { value: "created_at", label: "Latest Arrivals" },
  { value: "price_asc", label: "Price: Low → High" },
  { value: "price_desc", label: "Price: High → Low" },
]

// Фикс для countryCode
const getCountryCode = (pathname: string) => {
  const parts = pathname.split("/")
  return parts[1] || "de"
}

const RefinementList = () => {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const countryCode = getCountryCode(pathname)

  const currentSort = searchParams.get("sortBy") || "created_at"

  const sortQuery = useMemo(() => {
    const sort = currentSort ? `?sortBy=${currentSort}` : ""
    return sort
  }, [currentSort])

  return (
    <div className="flex small:flex-col gap-12 py-4 mb-8 small:px-0 pl-6 small:min-w-[250px] small:ml-[1.675rem]">
      {/* СОРТИРОВКА */}
      <div className="flex flex-col gap-2">
        <span className="text-xs uppercase text-gray-500">Sort by</span>
        {sortOptions.map(({ value, label }) => (
          <LocalizedClientLink
            key={value}
            href={`${pathname.split("?")[0]}?sortBy=${value}`}
            className={`text-left text-sm hover:underline ${
              currentSort === value ? "font-semibold" : "text-gray-600"
            }`}
          >
            {label}
          </LocalizedClientLink>
        ))}
      </div>

      {/* КАТЕГОРИИ */}
      <div className="flex flex-col gap-2">
        <span className="text-xs uppercase text-gray-500">Category</span>
        {[
          { handle: "shirts", label: "T-Shirts" },
          { handle: "sweatshirts", label: "Sweatshirts" },
          { handle: "accessories", label: "Accessories" },
        ].map(({ handle, label }) => (
          <LocalizedClientLink
            key={handle}
            href={`/${countryCode}/categories/${handle}${sortQuery}`}
            className={`text-left text-sm hover:underline ${
              pathname.includes(`/categories/${handle}`) ? "font-semibold" : "text-gray-600"
            }`}
          >
            {label}
          </LocalizedClientLink>
        ))}
      </div>

      {/* КОЛЛЕКЦИИ */}
      <div className="flex flex-col gap-2">
        <span className="text-xs uppercase text-gray-500">Collection</span>
        {[
          { handle: "spring", label: "Spring" },
          { handle: "love", label: "Love" },
        ].map(({ handle, label }) => (
          <LocalizedClientLink
            key={handle}
            href={`/${countryCode}/collections/${handle}${sortQuery}`}
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
