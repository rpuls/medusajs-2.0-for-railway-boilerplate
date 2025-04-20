"use client"

import { usePathname } from "next/navigation"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export type SortOptions = "price_asc" | "price_desc" | "created_at"

const sortOptions: { value: SortOptions; label: string }[] = [
  { value: "created_at", label: "Latest Arrivals" },
  { value: "price_asc", label: "Price: Low → High" },
  { value: "price_desc", label: "Price: High → Low" },
]

const RefinementList = () => {
  const pathname = usePathname()
  const countryCode = pathname.split("/")[1] || "en"

  return (
    <div className="flex small:flex-col gap-12 py-4 mb-8 small:px-0 pl-6 small:min-w-[250px] small:ml-[1.675rem]">
      <div className="flex flex-col gap-2">
        <span className="text-xs uppercase text-gray-500">Sort by</span>
        {sortOptions.map(({ value, label }) => (
          <LocalizedClientLink
            key={value}
            href={`/${countryCode}/store?sortBy=${value}`}
            className={`text-left text-sm hover:underline ${
              pathname.includes(value) ? "font-semibold" : "text-gray-600"
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
            pathname.includes("/store") && !pathname.includes("categories")
              ? "font-semibold"
              : "text-gray-600"
          }`}
        >
          All Categories
        </LocalizedClientLink>
        {["shirts", "sweatshirts", "accessories"].map((handle) => (
          <LocalizedClientLink
            key={handle}
            href={`/${countryCode}/categories/${handle}`}
            className={`text-left text-sm hover:underline ${
              pathname.includes(`/categories/${handle}`) ? "font-semibold" : "text-gray-600"
            }`}
          >
            {handle.charAt(0).toUpperCase() + handle.slice(1)}
          </LocalizedClientLink>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-xs uppercase text-gray-500">Collection</span>
        <LocalizedClientLink
          href={`/${countryCode}/store`}
          className={`text-left text-sm hover:underline ${
            pathname.includes("/store") && !pathname.includes("collections")
              ? "font-semibold"
              : "text-gray-600"
          }`}
        >
          All Collections
        </LocalizedClientLink>
        {["spring", "love"].map((handle) => (
          <LocalizedClientLink
            key={handle}
            href={`/${countryCode}/collections/${handle}`}
            className={`text-left text-sm hover:underline ${
              pathname.includes(`/collections/${handle}`) ? "font-semibold" : "text-gray-600"
            }`}
          >
            {handle.charAt(0).toUpperCase() + handle.slice(1)}
          </LocalizedClientLink>
        ))}
      </div>
    </div>
  )
}

export default RefinementList
