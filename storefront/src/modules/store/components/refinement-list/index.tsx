"use client"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { usePathname, useSearchParams } from "next/navigation"
import { useCallback } from "react"

export type SortOptions = "price_asc" | "price_desc" | "created_at"

const sortOptions: { value: SortOptions; label: string }[] = [
  { value: "created_at", label: "Latest Arrivals" },
  { value: "price_asc", label: "Price: Low → High" },
  { value: "price_desc", label: "Price: High → Low" },
]

const RefinementList = () => {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const countryCode = pathname.split("/")[1] // Correct extraction only once

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

  return (
    <div className="flex small:flex-col gap-12 py-4 mb-8 small:px-0 pl-6 small:min-w-[250px] small:ml-[1.675rem]">
      <div className="flex flex-col gap-2">
        <span className="text-xs uppercase text-gray-500">Sort by</span>
        {sortOptions.map(({ value, label }) => (
          <LocalizedClientLink
            key={value}
            href={`/${countryCode}/store?${createQueryString("sortBy", value)}`}
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
          href={`/${countryCode}/categories/shirts`}
          className="text-left text-sm hover:underline"
        >
          T-Shirts
        </LocalizedClientLink>
        <LocalizedClientLink
          href={`/${countryCode}/categories/sweatshirts`}
          className="text-left text-sm hover:underline"
        >
          Sweatshirts
        </LocalizedClientLink>
        <LocalizedClientLink
          href={`/${countryCode}/categories/accessories`}
          className="text-left text-sm hover:underline"
        >
          Accessories
        </LocalizedClientLink>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-xs uppercase text-gray-500">Collection</span>
        <LocalizedClientLink
          href={`/${countryCode}/collections/Springtime!`}
          className="text-left text-sm hover:underline"
        >
          Spring
        </LocalizedClientLink>
        <LocalizedClientLink
          href={`/${countryCode}/collections/friends`}
          className="text-left text-sm hover:underline"
        >
          Love
        </LocalizedClientLink>
      </div>
    </div>
  )
}

export default RefinementList

