// src/modules/store/components/refinement-list/index.tsx
"use client"

import { useEffect, useState, useMemo } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

import { getCategoriesList } from "@lib/data/categories"
import { getCollectionsList } from "@lib/data/collections"

export default function RefinementList() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const currentSort = searchParams.get("sortBy") || "created_at"

  const [categories, setCategories] = useState([])
  const [collections, setCollections] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      const { product_categories } = await getCategoriesList(0, 100)
      const { collections } = await getCollectionsList(0, 100)
      setCategories(product_categories || [])
      setCollections(collections || [])
    }
    fetchData()
  }, [])

  const sortOptions = [
    { value: "created_at", label: "Latest Arrivals" },
    { value: "price_asc", label: "Price: Low → High" },
    { value: "price_desc", label: "Price: High → Low" },
  ]

  return (
    <aside className="flex flex-col gap-y-8 text-base pr-4">
      <div className="flex flex-col gap-y-2">
        <span className="font-semibold text-xs">Sort By</span>
        <ul className="flex flex-col gap-y-1">
          {sortOptions.map((option) => (
            <li key={option.value}>
              <LocalizedClientLink
                href={`${pathname?.split("?")[0]}?sortBy=${option.value}`}
                className={`hover:underline ${
                  currentSort === option.value ? "font-semibold" : ""
                }`}
              >
                {option.label}
              </LocalizedClientLink>
            </li>
          ))}
        </ul>
      </div>

      {categories.length > 0 && (
        <div className="flex flex-col gap-y-2">
          <span className="font-semibold text-xs">Category</span>
          <ul className="flex flex-col gap-y-1">
            {categories
              .filter((cat) => !cat.parent_category)
              .map((c) => (
                <li key={c.id}>
                  <LocalizedClientLink
                    href={`/categories/${c.handle}`}
                    className={`hover:underline ${
                      pathname.includes(`/categories/${c.handle}`)
                        ? "font-semibold"
                        : ""
                    }`}
                  >
                    {c.name}
                  </LocalizedClientLink>
                </li>
              ))}
          </ul>
        </div>
      )}

      {collections.length > 0 && (
        <div className="flex flex-col gap-y-2">
          <span className="font-semibold text-xs">Collection</span>
          <ul className="flex flex-col gap-y-1">
            {collections.map((c) => (
              <li key={c.id}>
                <LocalizedClientLink
                  href={`/collections/${c.handle}`}
                  className={`hover:underline ${
                    pathname.includes(`/collections/${c.handle}`)
                      ? "font-semibold"
                      : ""
                  }`}
                >
                  {c.title}
                </LocalizedClientLink>
              </li>
            ))}
          </ul>
        </div>
      )}
    </aside>
  )
}


// lib/utils/sorting.ts
export const getSortOrder = (key: string): string => {
  switch (key) {
    case "price_asc":
      return "variants.prices.amount"
    case "price_desc":
      return "-variants.prices.amount"
    case "created_at":
    default:
      return "created_at"
  }
}


// В компоненте PaginatedProducts:
// const sortBy = searchParams.get("sortBy") || "created_at"
// const order = getSortOrder(sortBy)
// И передать `order` в products.list() как параметр.
