"use client"

import { usePathname } from "next/navigation"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const sortOptions = [
  { value: "created_at", label: "Latest Arrivals" },
  { value: "price_asc", label: "Price: Low → High" },
  { value: "price_desc", label: "Price: High → Low" },
]

const RefinementList = () => {
  const pathname = usePathname()
  const countryCode = pathname.split("/")[1] // example: "de"

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
              pathname.includes(`/store`) ? "font-semibold" : "text-gray-600"
            }`}
          >
            {label}
          </LocalizedClientLink>
        ))}
      </div>

      {/* Categories */}
      <div className="flex flex-col gap-2">
        <span className="text-xs uppercase text-gray-500">Category</span>
        <LocalizedClientLink
          href={`/${countryCode}/store`}
          className={`text-left text-sm hover:underline ${
            pathname === `/${countryCode}/store` ? "font-semibold" : "text-gray-600"
          }`}
        >
          All Categories
        </LocalizedClientLink>
        {[
          { value: "shirts", label: "T-Shirts" },
          { value: "sweatshirts", label: "Sweatshirts" },
          { value: "accessories", label: "Accessories" },
        ].map(({ value, label }) => (
          <LocalizedClientLink
            key={value}
            href={`/${countryCode}/categories/${value}`}
            className={`text-left text-sm hover:underline ${
              pathname.includes(`/categories/${value}`) ? "font-semibold" : "text-gray-600"
            }`}
          >
            {label}
          </LocalizedClientLink>
        ))}
      </div>

      {/* Collections */}
      <div className="flex flex-col gap-2">
        <span className="text-xs uppercase text-gray-500">Collection</span>
        <LocalizedClientLink
          href={`/${countryCode}/store`}
          className={`text-left text-sm hover:underline ${
            pathname === `/${countryCode}/store` ? "font-semibold" : "text-gray-600"
          }`}
        >
          All Collections
        </LocalizedClientLink>
        {[
          { value: "spring", label: "Spring" },
          { value: "love", label: "Love" },
        ].map(({ value, label }) => (
          <LocalizedClientLink
            key={value}
            href={`/${countryCode}/collections/${value}`}
            className={`text-left text-sm hover:underline ${
              pathname.includes(`/collections/${value}`) ? "font-semibold" : "text-gray-600"
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
